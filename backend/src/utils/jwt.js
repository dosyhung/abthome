const jwt = require('jsonwebtoken');

const generateToken = (userId, roleId) => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  // Payload
  const payload = {
    userId,
    roleId
  };

  // Sign token, exp 1d
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

module.exports = {
  generateToken
};
