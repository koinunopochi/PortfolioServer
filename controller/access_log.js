const { getDb } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

const insertAccessLog = async (data) => {
  const db = getDb();
  const result = await db.collection('access_logs').insertOne({
    ip: data.ip,
    method: data.method,
    url: data.url,
    time: data.date || new Date(),
  });
  return result;
};

exports.insertAccessLog = insertAccessLog;

const getAccessLogs = async (startTime, endTime) => {
  const db = getDb();
  const start = new Date(startTime);
  const end = new Date(endTime);

  // MongoDBの日時のクエリを用いて、指定された期間のログを取得
  return db
    .collection('access_logs')
    .find({
      time: {
        $gte: start,
        $lte: end,
      },
    })
    .toArray();
};

exports.getAccessLogs = getAccessLogs;
