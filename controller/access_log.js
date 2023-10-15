const { getDb } = require('../lib/mongo');
// const { ObjectId } = require('mongodb');
const DbOperations = require('./DbOperations');

const accessCollection = new DbOperations('access_logs');

// const insertAccessLog = async (data) => {
//   const db = getDb();
//   const result = await db.collection('access_logs').insertOne({
//     ip: data.ip,
//     method: data.method,
//     url: data.url,
//     time: data.date || new Date(),
//   });
//   return result;
// };
const insertAccessLog = async (ip, method, url, time) => {
  const time_ = time || new Date();
  return await accessCollection.insert({ ip, method, url, time: time_ });
};

exports.insertAccessLog = insertAccessLog;

// const getAccessLogs = async (startTime, endTime) => {
//   const db = getDb();
//   const start = new Date(startTime);
//   const end = new Date(endTime);

//   // MongoDBの日時のクエリを用いて、指定された期間のログを取得
//   return db
//     .collection('access_logs')
//     .find({
//       time: {
//         $gte: start,
//         $lte: end,
//       },
//     })
//     .toArray();
// };
const getAccessLogs = async(start_time, end_time) => {
    const start = new Date(start_time);
    const end = new Date(end_time);
  return await accessCollection.find({ time: { $gte: start, $lte: end } });
};
exports.getAccessLogs = getAccessLogs;
