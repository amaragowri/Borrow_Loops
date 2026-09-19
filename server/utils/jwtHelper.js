const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'borrowloop_super_secret_jwt_key_2026_modern_marketplace_token',
    {
      expiresIn: '30d',
    }
  );
};

module.exports = { generateToken };
