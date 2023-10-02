const express = require('express');
const router = express.Router();
const {
  insertBlog,
  getBlogs,
  deleteBlog,
  getBlog,
  getBloOverviews,
} = require('../controller/blog');
const { logger } = require('../lib/logger');
const { MyCustomError } = require('../lib/custom_error');

router.get('/overviews', async (req, res, next) => {
  try {
    const overviews = await getBloOverviews();
    res.json(overviews);
  } catch (err) {
    next(err);
  }
});

// とりあえずは、問題がない
// idのブログの情報をとる
router.get('/:blogId', async (req, res, next) => {
  try {
    const blog = await getBlog(req.params.blogId); // 更新
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
router.get('/', async (req, res, next) => {
  try {
    const blogs = await getBlogs(); // 更新
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

// 最低限追加が可能、バリデーションは自身しか使わないため、不要
router.post('/', async (req, res, next) => {
  try {
    const { title, content, overview } = req.body;
    const savedBlog = await insertBlog({
      title: title,
      overview: overview,
      content: content,
    });
    logger.debug(savedBlog);
    logger.info('id:' + savedBlog.insertedId);
    res.json({
      message: 'Blog created',
      blog: { title, content },
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
