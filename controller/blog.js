const { ObjectId } = require('mongodb');
const DbOperations = require('./DbOperations');

const blogsCollection = new DbOperations('blogs');

/**
 * blogを挿入する
 * @param {string} title タイトル
 * @param {string} content 内容
 * @param {string} overview 概要
 * @param {string} category info, portfolio, blogのいずれか
 * @param {string} tags タグ
 * @param {string} role 
 * @param {Date} date 最初の投稿日
 * @param {Date} update_date 更新日
 * @returns 
 */
const insertBlog = async (title,content,overview,category,tags,role,date,update_date) => {
  const date_ = date || new Date();
  const update_date_ = update_date || new Date();
  return await blogsCollection.insert({
    title,
    content,
    overview,
    category,
    tags,
    role,
    date: date_,
    update_date:update_date_
  });
}
/**
 * blogを更新する
 * @param {string} id 
 * @param {string} title タイトル
 * @param {string} content 内容
 * @param {string} overview 概要
 * @param {string} category info, portfolio, blogのいずれか
 * @param {string} tags タグ
 * @param {string} role 
 * @returns 
 */
const updateBlog = async (id, title,content,category,tags,role,overview) => {
  return await blogsCollection.update(
    { _id: new ObjectId(id) },
    {
      $set: {
        title,
        content,
        category,
        tags,
        role,
        overview,
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
