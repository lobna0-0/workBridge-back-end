const { randomUUID } = require('crypto');
const path = require('path');
const ProjectFile = require('../models/project_files.model');
const upload = require('../config/multer');
const { authMW } = require('../middleWare/auth.middleware');
const supabase = require('../config/supabase');

const BUCKET = 'project-files';
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);

const sanitizeExt = (originalName = '') => {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  return ext && ext.length <= 10 ? ext : '';
};

// Upload project file (Supabase Storage)
exports.uploadFile = [
  authMW,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const project_id = req.body.project_id;
      if (!project_id) {
        return res.status(400).json({ error: 'project_id is required' });
      }

      if (req.file.size > MAX_BYTES) {
        return res.status(400).json({ error: 'File too large' });
      }

      const mime = req.file.mimetype;
      if (mime && !ALLOWED_MIME.has(mime)) {
        return res.status(400).json({ error: 'File type not allowed' });
      }

      const originalExt = sanitizeExt(req.file.originalname);
      const uuid = randomUUID();
      const storagePath = `project-files/${project_id}/${uuid}${originalExt}`;
      // storagePath above includes bucket folder; Supabase expects object path WITHOUT bucket name
      const objectPath = `${project_id}/${uuid}${originalExt}`;

      // Upload using service role is recommended, but minimal change: use RLS-compatible upload if configured.
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, req.file.buffer, {
          contentType: mime || 'application/octet-stream',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // If bucket is public, getPublicUrl works. If private, you should return a signed URL instead.
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

      const fileData = {
        project_id,
        file_url: pub.publicUrl,
        uploaded_by: req.user.id
      };

      const file = await ProjectFile.createProjectFile(fileData);

      res.status(201).json({
        message: 'File uploaded successfully',
        data: file
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Get project files
exports.getProjectFiles = async (req, res) => {
  try {
    const files = await ProjectFile.getByProject(req.params.projectId);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete file (DB record only; remove storage object if needed)
exports.deleteFile = [
  authMW,
  async (req, res) => {
    try {
      await ProjectFile.deleteFile(req.params.id);
      res.json({ message: 'File deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];


