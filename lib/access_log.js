const { insertAccessLog } = require('../controller/access_log');
const { logger } = require('./logger');

const accessLog = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const url = req.url;
    const time = new Date();
    logger.info(`${ip} - ${time} - ${method} - ${url}`);
    const data = {
      ip: ip,
      method: method,
      url: url,
      date: time,
    };
    await insertAccessLog(data);
    next();
  } catch (error) {
    next(error);
  }
};

exports.accessLog = accessLog;
