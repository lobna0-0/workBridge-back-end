const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');
const upload = require('../config/multer');
const skillController = require('../controllers/skills.controller');
const User = require('../models/user.model');
const passwordResetController = require('../controllers/passwordReset.controller');

// ================= AUTH =================
router.post('/register', upload.single('image'), userController.createUser);
router.post('/google-login', userController.googleLogin);
router.post('/login', userController.login);

// ================= PASSWORD RESET =================
router.post('/forgot-password', passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetController.resetPassword);



// ================= SKILLS (:id) =================

// get all skills
router.get('/skills/all', skillController.getAllSkills);

// update skills
router.put('/skills', authMW, allowRoles('freelancer'), skillController.updateUserSkills);

// add skills 
router.post('/skills', authMW, allowRoles('freelancer'), skillController.addUserSkills);

// delete skills
router.delete('/skills', authMW, allowRoles('freelancer'), skillController.deleteUserSkill);

// get user skills
router.get('/:id/skills', skillController.getUserSkills);

// ================= USERS =================

// current user
router.get('/me', authMW, async (req, res) => {
  try {
    const users = await User.getUserById(req.user.id);
    const user = users?.[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all users
router.get('/',   userController.getAllUsers);

// get user by id
router.get('/:id', userController.getUserById);

// update user
router.put('/:id', authMW, upload.single('image'), userController.updateUser);
router.patch('/:id', authMW, upload.single('image'), userController.updateUser);

// delete user
router.delete('/:id', authMW, allowRoles('admin'), userController.deleteUser);

module.exports = router;