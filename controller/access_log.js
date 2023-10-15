const DbOperations = require('./DbOperations');

const accessCollection = new DbOperations('access_logs');

/**
 * アクセスされたログをDBに保存する
 * @param {string} ip ip address
 * @param {string} method POST, GET, PUT, DELETE 
 * @param {url} url アクセスされたURL
 * @param {Date} time アクセス時間
 * @returns 
 */
const insertAccessLog = async (ip, method, url, time) => {
  const time_ = time || new Date();
  return await accessCollection.insert({ ip, method, url, time: time_ });
};
exports.insertAccessLog = insertAccessLog;

/**
 * 時間によってアクセスされたログを取得する
 * @param {Date} start_time 取得する時間の開始
 * @param {Date} end_time 取得する時間の終了
 * @returns 
 */
const getAccessLogs = async(start_time, end_time) => {
    const start = new Date(start_time);
    const end = new Date(end_time);
  return await accessCollection.find({ time: { $gte: start, $lte: end } });
};
exports.getAccessLogs = getAccessLogs;
