const express = require('express');
const router = express.Router();
const {
  insertBlog,
  getBlogs,
  deleteBlog,
  getBlog,
  getBlogOverviews,
  updateBlog,
} = require('../controller/blog');
const { logger } = require('../lib/logger');
const { MyCustomError } = require('../lib/custom_error');
const { admin_route } = require('../lib/admin_route');

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
router.get('/', async (req, res, next) => {
  try {
    const blogs = await getBlogs(); // 更新
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
    const savedBlog = await insertBlog({
      title: title,
      overview: overview,
      category: category,
      tags: tags,
      content: content,
    });
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
    const savedBlog = await updateBlog(id, {
      title: title,
      overview: overview,
      category: category,
      tags: tags,
      content: content,
    });
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
