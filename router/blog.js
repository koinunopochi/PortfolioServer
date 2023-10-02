const express = require('express');
const router = express.Router();
const { insertBlog, getBlogs, deleteBlog } = require('../controller/blog'); // 更新
const { logger } = require('../lib/logger');

router.get('/', async (req, res) => {
  try {
    const blogs = await getBlogs(); // 更新
    res.json(blogs);
  } catch (err) {
    res.json({ message: err });
  }
});

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

router.delete('/:blogId', async (req, res) => {
  try {
    const isDeleted = await deleteBlog(req.params.blogId); // 更新
    if (isDeleted) {
      res.json({ message: 'Blog deleted' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (err) {
    res.json({ message: err });
  }
});

exports.router = router;
