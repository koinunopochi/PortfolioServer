const jwt = require('jsonwebtoken');
const { getUserAll } = require('../controller/user');
const { MyCustomError } = require('./custom_error');
const { logger } = require('./logger');

const protect = async (req, res, next) => {
  // jwtからusernameを取得する
  // usernameからroleを取得する
  // roleがadminか確認する
  try {
    const cookie = req.cookies.authToken;
    if (!cookie) {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    const decoded = jwt.verify(cookie, process.env.SECRET_KEY);
    const username = decoded.username;
    const userInfo = await getUserAll(username);
    logger.debug(userInfo.role);
    if (userInfo.role !== 'admin') {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new MyCustomError('TokenExpiredError', 'token expired', 400));
    }
    next(error);
  }
};
exports.admin_route = protect;

const isAdmin = async (req) => {
  try {
    const cookie = req.cookies.authToken;
    if (!cookie) {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    const decoded = jwt.verify(cookie, process.env.SECRET_KEY);
    const username = decoded.username;
    const userInfo = await getUserAll(username);
    logger.debug(userInfo.role);
    if (userInfo.role !== 'admin') {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
};
exports.isAdmin = isAdmin;
