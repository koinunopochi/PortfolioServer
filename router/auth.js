const express = require('express');
const { MyCustomError } = require('../lib/custom_error');
const {
  ValidationEmail,
  ValidationPassword,
  ValidationParams,
} = require('../lib/validate');
const { getUserInfo } = require('../controller/user');
const router = express.Router();

const bcrypt = require('bcrypt');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    ValidationParams(req.body, ['email', 'password']);
    ValidationEmail(email);
    ValidationPassword(password);

    console.log(email, password);

    const user = await getUserInfo({ email });

    console.log(user);

    if (!user) {
      throw new MyCustomError('NotExistUser', 'not exist user', 400);
    }
    const is_password = await bcrypt.compare(password, user.password);
    if (!is_password) {
      throw new MyCustomError('InvalidPassword', 'invalid password', 400);
    }
    if (!user.is_verify) {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    next(err);
  }
});

exports.router = router;
