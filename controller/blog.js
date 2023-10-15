const { ObjectId } = require('mongodb');
const DbOperations = require('./DbOperations');

const blogsCollection = new DbOperations('blogs');

/**
 * blogの追加
 * @param {JSON} data 
 * @returns 
 */
const insertBlog = async (data) => {
  return await blogsCollection.insert({
    title: data.title,
    content: data.content,
    overview: data.overview,
    category: data.category,
    tags: data.tags,
    role: data.role,
    date: data.date || new Date(),
    update_date: data.update_date || new Date(),
  });
}
/**
 * idに合致するblogの情報をアップデートする
 * @param {string} id blog id
 * @param {JSON} data json data
 * @returns 
 */
const updateBlog = async (id, data) => {
  return await blogsCollection.update(
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
};

/**
 * すべてのblogを取得する
 * @returns {Array} blogの配列
 */
const getAllBlogs = async () => {
  return await blogsCollection.find({ role: { $ne: 'draft' } });
};
// exports.getAllBlogs = getAllBlogs;

/**
 * blogの概要情報を取得する
 * @returns {Array} blogの概要情報の配列
 */
const getBlogOverviews = async () => {
  return await blogsCollection.find(
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
  );
};


// 未使用
const getBlogOverviewsIgnoreDraft = async () => {
  return await blogsCollection.find(
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
  );
};
exports.getBlogOverviewsIgnoreDraft = getBlogOverviewsIgnoreDraft;

/**
 * idからblog情報を取得する
 * @param {string} id  blog id
 * @returns 
 */
const getBlog = async (id) => {
  return await blogsCollection.findOne({ _id: new ObjectId(id) });
}

// 現在未使用
const getBlogIgnoreDraft = async (id) => {
  return await blogsCollection.findOne({ _id: new ObjectId(id), role: { $ne: 'draft' } });
};
exports.getBlogIgnoreDraft = getBlogIgnoreDraft;


/**
 * blogの削除
 * @param {string} id blog id 
 * @returns {boolean} 削除に成功した場合はtrue
 */
const deleteBlog = async (id) => {
  const result = await blogsCollection.delete({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};

module.exports = {
  insertBlog,
  deleteBlog,
  getBlog,
  getBlogOverviews,
  updateBlog,
  getAllBlogs,
};
