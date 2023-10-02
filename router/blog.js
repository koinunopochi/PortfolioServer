const express = require('express');
const router = express.Router();
const { insertBlog, getBlogs, deleteBlog } = require('../controller/blog'); // 更新
const { logger } = require('../lib/logger');

// とりあえずは、問題がない
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
