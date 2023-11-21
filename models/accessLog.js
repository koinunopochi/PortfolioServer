const { logger } = require('../lib/logger');
const DbOperations = require('../lib/DbOperations');
const { getDb } = require('../lib/mongo');

let accessCollection;
getDb().then((db) => {
  accessCollection = new DbOperations(db, 'access_logs');
  logger.info('MongoDB create new [access_logs] instance');
});

/**
 * アクセスされたログをDBに保存する
 * @param {string} ip ip address
 * @param {string} method POST, GET, PUT, DELETE
 * @param {url} url アクセスされたURL
 * @param {Date} time アクセス時間
 * @returns
 */
const insertAccessLog = async ({ip, method, url, time}) => {
  const time_ = time || new Date();
  return await accessCollection.insert({ ip, method, url, time: time_ });
};
exports.insertAccessLog = insertAccessLog;

/**
 * 時間によってアクセスされたログを取得する
 * @param {Date} startTime 取得する時間の開始
 * @param {Date} endTime 取得する時間の終了
 * @returns
 */
const getAccessLogs = async ({startTime, endTime}) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return await accessCollection.find({ time: { $gte: start, $lte: end } });
};
exports.getAccessLogs = getAccessLogs;
