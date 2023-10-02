const jwt = require('jsonwebtoken');
const { getUserInfo } = require('../controller/user');
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
    const userInfo = await getUserInfo({ username });
    logger.debug(userInfo.role);
    if (userInfo.role !== 'admin') {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.admin_route = protect;
