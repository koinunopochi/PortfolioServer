const { getDb } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

const insertBlog = async (data) => {
  const db = getDb();
  const result = await db.collection('blogs').insertOne({
    title: data.title,
    content: data.content,
    date: data.date || new Date(),
  });
  return result.ops[0];
};

const getBlogs = async () => {
  const db = getDb();
  return db.collection('blogs').find().toArray();
};

const deleteBlog = async (id) => {
  const db = getDb();
  const result = await db.collection('blogs').deleteOne({ _id: ObjectId(id) });
  return result.deletedCount === 1;
};

module.exports = { insertBlog, getBlogs, deleteBlog };
