import jwt from 'jsonwebtoken';

var JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

export const generateToken = (userId) => {
  JWT_SECRET = process.env.JWT_SECRET;
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  try {
    JWT_SECRET = process.env.JWT_SECRET;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};