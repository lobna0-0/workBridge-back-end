const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

// create token
exports.createToken = (data) => {
    return jwt.sign(data, secretKey, { expiresIn: '2h' });
};

// verify token 
exports.verifyToken = (token) => {
    return jwt.verify(token, secretKey);
};