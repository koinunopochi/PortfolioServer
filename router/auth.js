const express = require('express');
const MyCustomError = require('../lib/custom_error');
const router = express.Router();



router.post('/login', (req, res) => {
  // Login code here
  console.log(req.body);
  if(!req.body.username || !req.body.password) {
    throw new MyCustomError('BadRequest', 'Username or password is missing', 400);
  }

  res.json({ message: 'Login successful' });
});

exports.router = router;
