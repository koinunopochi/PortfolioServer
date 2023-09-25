const jwt = require('jsonwebtoken');
require('dotenv').config();

const {AuthenticationError,AuthorizationError} = require('./custom_error');
const { logger } = require('./logger');
const SECRET_KEY = process.env.SECRET_KEY;

const protectedRoutes = (req, res, next) => {
  const token = req.cookies.authToken;
  logger.debug(req.cookies);
  logger.info(token);
    if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        throw new AuthorizationError('Invalid token');
      }
      req.user = user;
      next();
    });
  } else {
    throw new AuthenticationError('Authentication token required');
  }
};
exports.protectedRoutes = protectedRoutes;