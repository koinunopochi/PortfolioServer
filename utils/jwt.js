const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const { logger } = require('../lib/logger');
const crypto = require('crypto');

const decodeItem = (token,item="email") => {
  const decoded = jwt.verify(token, SECRET_KEY);
  logger.debug(decoded);
  return decoded[item];
};
exports.decodeItem = decodeItem;

const generateKey = () => {
  const key = crypto.randomBytes(32).toString('hex');
  console.log(key);
};
// generateKey();
exports.generateKey = generateKey;
