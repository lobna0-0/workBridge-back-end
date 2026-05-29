const User = require('../models/user.model');
const {hashPassword, compare} = require('../utils/hashing');
const {createToken} = require('../utils/auth');
const {cloudinaryUpload} = require('../config/cloudinary');
const userSchema = require('../validations/user.validation');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../config/supabase');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, bio } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        let image = null;

        //  رفع الصورة باستخدام buffer
        if (req.file) {
            const uploaded = await cloudinaryUpload(req.file.buffer);
            image = uploaded.secure_url;
        }

        const hashedPassword = await hashPassword(password);

        const { data, error } = await User.createUser({
            name,
            email,
            password: hashedPassword,
            role: role || 'client',
            bio: bio || '',
            image
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({
            message: 'User created successfully',
            user: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Google Login — fixed to return token
exports.googleLogin = async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const token = req.body?.token;

    if (!token) {
      return res.status(400).json({
        message: "Token is required"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google payload"
      });
    }

    const { email, name, picture } = payload;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    let user = users?.[0];

    if (!user) {

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          image: picture,
          password: null,
          role: 'client'
        }])
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({
          message: insertError.message
        });
      }

      user = newUser;
    }

    const jwtToken = createToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      user,
      token: jwtToken
    });

  } catch (err) {

    console.error("GOOGLE LOGIN ERROR:", err);

    return res.status(500).json({
      message: err.message
    });
  }
};
// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const data = await User.getAllUsers();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get user by id
exports.getUserById = async (req, res) => {
  try {
    const data = await User.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      user: data?.[0] || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// update user
// update user
exports.updateUser = async (req, res) => {
  try {

console.log("REQ USER:", req.user);
console.log("BODY:", req.body);

    const targetUserId = Number(req.params.id);
    const currentUserId = Number(req.user?.id);

    // admin أو اليوزر نفسه
    if (
      !req.user ||
      (req.user.role !== 'admin' && currentUserId !== targetUserId)
    ) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    // fields العادية
    const allowedFields = [
      'name',
      'bio',
      'title',
      'location',
      'company_name',
      'company_website'
    ];

    // admin only
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'status');
    }

    const updatedData = {};

    allowedFields.forEach((field) => {

      if (
        Object.prototype.hasOwnProperty.call(req.body, field)
      ) {

        const value = req.body[field];

        if (value !== undefined && value !== null) {
          updatedData[field] = value;
        }
      }
    });

    // image upload
    if (req.file) {
      const uploaded = await cloudinaryUpload(req.file.buffer);
      updatedData.image = uploaded.secure_url;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const data = await User.updateUser(
      req.params.id,
      updatedData
    );

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Update failed'
      });
    }

    return res.status(200).json({
      success: true,
      user: data
    });

  } catch (error) {

    console.error('UPDATE ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// delete user 
exports.deleteUser = async (req, res) => {
  try {
    const data = await User.deleteUser(req.params.id);

    res.status(200).json({
      message: 'User deleted successfully',
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const passwordResetController = require('./passwordReset.controller');

// login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const users = await User.getUserByEmail(email);
    const user = users?.[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};