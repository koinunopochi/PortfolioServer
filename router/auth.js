const express = require('express');
const { MyCustomError } = require('../lib/custom_error');
const {
  ValidationEmail,
  ValidationPassword,
  ValidationParams,
} = require('../lib/validate');
const { getUserInfo, insertRefreshToken, getRefreshToken, deleteRefreshToken } = require('../controller/user');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logger } = require('../lib/logger');

require('dotenv').config();
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

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

    // リフレッシュトークンがあるか確認
    const is_refresh_token = await getRefreshToken(email);
    logger.debug(is_refresh_token);
    // リフレッシュトークンがある場合は削除
    if (is_refresh_token) {
      await deleteRefreshToken(email);
    }

    // JWTを発行
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ email }, REFRESH_SECRET_KEY, {
      expiresIn: '7d',
    });
    // リフレッシュトークンをDBに保存
    await insertRefreshToken(email, refreshToken);

    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: 'localhost',
    });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: 'localhost',
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    next(err);
  }
});

exports.router = router;
