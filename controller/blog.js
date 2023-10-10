const { getDb } = require('../lib/mongo');
const { ObjectId } = require('mongodb');

const insertBlog = async (data) => {
  const db = getDb();
  const result = await db.collection('blogs').insertOne({
    title: data.title,
    content: data.content,
    overview: data.overview,
    category: data.category,
    tags: data.tags,
    role: data.role,
    date: data.date || new Date(),
    update_date: data.update_date || new Date(),
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
        category: data.category,
        tags: data.tags,
        role: data.role,
        overview: data.overview,
        update_date: new Date(),
      },
    }
  );
  return result;
};

const getBlogs = async () => {
  const db = getDb();
  return db
    .collection('blogs')
    .find({ role: { $ne: 'draft' } })
    .toArray();
};


const getBlogOverviews = async () => {
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
          category:1,
          tags:1,
          date: 1,
          update_date: 1,
        },
      }
    )
    .toArray();
  return overviews;
};
const getBlogOverviewsIgnoreDraft = async () => {
  const db = getDb();
  const overviews = await db
    .collection('blogs')
    .find(
      { role: { $ne: 'draft' } },
      {
        projection: {
          _id: 1,
          title: 1,
          overview: 1,
          category: 1,
          tags: 1,
          date: 1,
          update_date: 1,
        },
      }
    )
    .toArray();
  return overviews;
};
exports.getBlogOverviewsIgnoreDraft = getBlogOverviewsIgnoreDraft;


const getBlog = async (id) => {
  const db = getDb();
  return db.collection('blogs').findOne({ _id: new ObjectId(id) });
}
const getBlogIgnoreDraft = async (id) => {
  const db = getDb();
  return db
    .collection('blogs')
    .findOne({ _id: new ObjectId(id), role: { $ne: 'draft' } });
};
exports.getBlogIgnoreDraft = getBlogIgnoreDraft;


const deleteBlog = async (id) => {
  const db = getDb();
  const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};

module.exports = { insertBlog, getBlogs, deleteBlog, getBlog , getBlogOverviews, updateBlog};
