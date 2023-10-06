const { getDb } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

const insertBlog = async (data) => {
  const db = getDb();
  const result = await db.collection('blogs').insertOne({
    title: data.title,
    content: data.content,
    overview: data.overview,
    date: data.date || new Date(),
  });
  return result;
};

const updateBlog = async (id, data) => {
  const db = getDb();
  const result = await db.collection('blogs').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title: data.title,
        content: data.content,
        overview: data.overview,
      },
    }
  );
  return result;
};

const getBlogs = async () => {
  const db = getDb();
  return db.collection('blogs').find().toArray();
};

const getBloOverviews = async () => {
  const db = getDb();
  const overviews = await db
    .collection('blogs')
    .find(
      {},
      {
        projection: {
          _id: 1, // 明示的に_idを含める。
          title: 1,
          overview: 1,
        },
      }
    )
    .toArray();
  return overviews;
};


const getBlog = async (id) => {
  const db = getDb();
  return db.collection('blogs').findOne({ _id: new ObjectId(id) });
}

const deleteBlog = async (id) => {
  const db = getDb();
  const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};

module.exports = { insertBlog, getBlogs, deleteBlog, getBlog , getBloOverviews, updateBlog};
