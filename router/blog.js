const express = require('express');
const router = express.Router();
const {
  insertBlog,
  getAllBlogs,
  deleteBlog,
  getBlog,
  getBlogOverviews,
  updateBlog,
} = require('../models/blog');
const { logger } = require('../lib/logger');
const { MyCustomError } = require('../lib/CustomError');
const { admin_route } = require('../utils/adminRoute');

// 未認証ルート

/**
 * すべてのブログの概要を取得するエンドポイント。
 * 
 * @route GET /overviews
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object[]} JSON - すべてのブログの概要のリスト。
 * @throws {Error} データベースエラーやその他の問題が発生した場合にエラーをスローします。
 */
router.get('/overviews', async (req, res, next) => {
  try {
    const overviews = await getBlogOverviews();
    res.json(overviews);
  } catch (err) {
    next(err);
  }
});


/**
 * 指定したIDのブログの情報を取得するエンドポイント。
 * 
 * @route GET /:blogId
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object} JSON - 指定したIDのブログの情報。
 * @throws {MyCustomError} ブログが見つからない場合、または無効なブログIDが指定された場合にエラーをスローします。
 */
router.get('/:blogId', async (req, res, next) => {
  try {
    const blog = await getBlog(req.params.blogId);
    if (blog) {
      res.json(blog);
    } else {
      throw new MyCustomError('BlogNotFound', 'blog not found', 404);
    }
  } catch (err) {
    if ((err.name = 'BSONError')) {
      next(new MyCustomError('InvalidBlogId', 'invalid blog id', 400));
    } else {
      next(err);
    }
  }
});


/**
 * すべてのブログの情報を取得するエンドポイント。
 * 注意: 実際の運用においては、すべての情報を取得するのではなく、概要だけを取得すべきである。
 * しかし、現在のフロントエンドプロジェクトのインデックス部分で誤ってこのエンドポイントを使用しているため、
 * その部分の修正が必要です。
 * 
 * @route GET /
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Array<Object>} JSON - 取得したすべてのブログの情報。
 * 
 * TODO: フロントエンドプロジェクトのインデックス部分での使用を修正する。
 */
router.get('/', async (req, res, next) => {
  try {
    const blogs = await getAllBlogs();
    // const blogs = await getBlogOverviews();
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});


// 認証ルート　＆＆　バリデーションは自身しか使わないため、不要
router.use(admin_route);

/**
 * 新しいブログを作成するエンドポイント。
 * 
 * @route POST /
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} req.body - リクエストボディ。
 * @param {string} req.body.title - ブログのタイトル。
 * @param {string} req.body.content - ブログのコンテンツ。
 * @param {string} req.body.overview - ブログの概要。
 * @param {string} req.body.category - ブログのカテゴリ。
 * @param {Array<string>} req.body.tags - ブログのタグのリスト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object} JSON - 作成が成功した場合のメッセージおよびブログの情報。
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, content, overview, category, tags } = req.body;
    const savedBlog = await insertBlog(
      title,
      content,
      overview,
      category,
      tags
    );
    logger.debug(savedBlog);
    logger.info('id:' + savedBlog.insertedId);
    res.json({
      message: 'Blog created',
      blog: { title, overview, content },
      id: savedBlog.insertedId,
    });
  } catch (err) {
    next(err);
  }
});


/**
 * 指定されたIDのブログを更新するエンドポイント。
 * 
 * @route PUT /:blogId
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} req.params - ルートのパラメータ。
 * @param {string} req.params.blogId - 更新するブログのID。
 * @param {Object} req.body - リクエストボディ。
 * @param {string} req.body.title - ブログのタイトル。
 * @param {string} req.body.content - ブログのコンテンツ。
 * @param {string} req.body.overview - ブログの概要。
 * @param {string} req.body.category - ブログのカテゴリ。
 * @param {Array<string>} req.body.tags - ブログのタグのリスト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object} JSON - 更新が成功した場合のメッセージおよびブログの情報。
 */
router.put('/:blogId', async (req, res, next) => {
  try {
    const { title, content, overview, category, tags } = req.body;
    const id = req.params.blogId;
    const savedBlog = await updateBlog(
      id,
      title,
      content,
      overview,
      category,
      tags
    );
    logger.debug(savedBlog);
    logger.info('id:' + savedBlog.insertedId);
    res.json({
      message: 'Blog updated',
      blog: { title, overview, content },
      id: savedBlog.insertedId,
    });
  } catch (err) {
    next(err);
  }
});


/**
 * 指定されたIDのブログを削除するエンドポイント。
 * 
 * @route DELETE /:blogId
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} req.params - ルートのパラメータ。
 * @param {string} req.params.blogId - 削除するブログのID。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object} JSON - 削除が成功した場合は成功メッセージ、失敗した場合はエラーメッセージ。
 */
router.delete('/:blogId', async (req, res, next) => {
  try {
    const isDeleted = await deleteBlog(req.params.blogId);
    logger.debug(isDeleted);
    if (isDeleted) {
      logger.info('deleted blog' + req.params.blogId);
      res.json({ message: 'Blog deleted' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (err) {
    next(err);
  }
});


exports.router = router;
