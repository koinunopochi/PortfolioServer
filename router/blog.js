const express = require('express');
const router = express.Router();
const {
  insertBlog,
  getAllBlogs,
  deleteBlog,
  getBlog,
  getBlogOverviews,
  updateBlog,
} = require('../controller/blog');
const { logger } = require('../lib/logger');
const { MyCustomError } = require('../utils/CustomError');
const { admin_route } = require('../utils/admin_route');

// 未認証ルート
router.get('/overviews', async (req, res, next) => {
  try {
    const overviews = await getBlogOverviews();
    res.json(overviews);
  } catch (err) {
    next(err);
  }
});

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

// とりあえずは、問題がない
// 全部のブログの情報をとるが、あまりよくない
// overviewsを使うべき
// TODO:フロントのぷろじぇくとインデックスの部分で誤って使用しているため、変更する
router.get('/', async (req, res, next) => {
  try {
    const blogs = await getAllBlogs(); // 更新
    // const blogs = await getBlogOverviews(); // 更新
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

// 認証ルート
router.use(admin_route);

// 最低限追加が可能、バリデーションは自身しか使わないため、不要
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
      message: 'Blog created',
      blog: { title, overview, content },
      id: savedBlog.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// とりあえずは、問題がない
router.delete('/:blogId', async (req, res, next) => {
  try {
    const isDeleted = await deleteBlog(req.params.blogId); // 更新
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
