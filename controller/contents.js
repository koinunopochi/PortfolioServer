const {getDb} = require('../lib/mongo');

const insertContents = async (data) => {
  const db = getDb();
  const collection = db.collection('contents');
  const result = await collection.insertOne(data);
  return result;
};
exports.insertContents = insertContents;
