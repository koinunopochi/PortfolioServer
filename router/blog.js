const express = require('express');
const router = express.Router();
const { insertBlog, getBlogs, deleteBlog } = require('../controller/blog'); // 更新

router.get('/', async (req, res) => {
  try {
    const blogs = await getBlogs(); // 更新
    res.json(blogs);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post('/', async (req, res) => {
  try {
    const savedBlog = await insertBlog({
      title: req.body.title,
      content: req.body.content,
    });
    console.log(savedBlog);
    res.json(savedBlog);
  } catch (err) {
    res.json({ message: err });
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
