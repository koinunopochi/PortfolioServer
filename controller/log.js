const { getDb } = require('../lib/mongo');
// const { MyCustomError } = require('../lib/custom_error');
const { decodeItem } = require('../lib/jwt');
const { logger } = require('../lib/logger');

const insertId = async (email, id, name) => {
    const db = getDb();
    const collection = db.collection('logs_group');
    const result = await collection.insertOne({ email, id, name });
    return result;
};
exports.insertId = insertId;

const getGroups = async (email) => {
  const db = getDb();
  const collection = db.collection('logs_group');
  const groups = await collection
    .find({ email }, { projection: { _id: 0, id: 1, name: 1 } })
    .toArray();

  return groups;
}
exports.getGroups = getGroups;

const getLogs = async (req,id) => {
  const db = getDb();
  const email = decodeItem(req.cookies.authToken);
  logger.debug(email);
  const collection = db.collection('contents');
  const logs = await collection
    .find({email,'request.id': id })
    .toArray();

  return logs;
}
exports.getLogs = getLogs;