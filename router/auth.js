const express = require('express');
const {
  MyCustomError,
  InvalidRefreshTokenError,
} = require('../lib/CustomError');
const { ValidationPassword, ValidationParams } = require('../utils/validate');
const {
  getUserAll,
  insertRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  insertUser,
  deleteUser,
  updateAccessNum,
} = require('../controller/user');
const router = express.Router();

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logger } = require('../lib/logger');
const { admin_route, isAdmin } = require('../utils/adminRoute');
const { decodeItem } = require('../lib/jwtHelper');

require('dotenv').config();
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

router.post('/signup', admin_route, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    // パラメータのチェック
    ValidationParams(req.body, ['username', 'password']);
    // ValidationEmail(email);
    if (username == '') {
      throw new MyCustomError('InvalidUsername', 'invalid username', 400);
    }
    ValidationPassword(password);
    // logger.debug(email);
    // userの存在確認
    const user = await getUserAll(username);
    if (!user) {
      logger.debug(user);
      logger.debug('user is not exist');
    } else {
      if (user.is_verify == true) {
        throw new MyCustomError('ExistUserError', 'email already exists', 400);
      } else {
        // すでに未認証のユーザーが存在する場合は削除
        await deleteUser(username);
      }
    }

    // ユーザー情報をDBに保存
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(16).toString('hex'); // トークンの生成
    const result = await insertUser(
      username,
      hashedPassword,
      verificationToken,
      true,
      'user'
    );

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

// login API
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    ValidationParams(req.body, ['username', 'password']);
    if (username == '') {
      throw new MyCustomError('InvalidUsername', 'invalid username', 400);
    }
    ValidationPassword(password);

    const user = await getUserAll(username);

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
    const is_refresh_token = await getRefreshToken(username);
    // logger.debug("is_refresh_token:"+is_refresh_token.refresh_token);
    // リフレッシュトークンがある場合は削除
    if (is_refresh_token) {
      await deleteRefreshToken(username);
    }

    // JWTを発行
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, REFRESH_SECRET_KEY, {
      expiresIn: '7d',
    });
    // リフレッシュトークンをDBに保存
    await insertRefreshToken(username, refreshToken);
    // アクセス回数を更新
    await updateAccessNum(username);
    // クッキーにトークンを保存
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'None',
    });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      // sameSite: 'None',
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    next(err);
  }
});

/**
 * ユーザーのログアウトを処理するエンドポイント。
 * 提供されたリフレッシュトークンを使用して、サーバー側で該当のトークンを無効化し、
 * クライアントの認証トークンとリフレッシュトークンの両方のクッキーをクリアします。
 * 
 * @route POST /logout
 * @param {Request} req - Expressのリクエストオブジェクト。
 * @param {Response} res - Expressのレスポンスオブジェクト。
 * @param {NextFunction} next - Expressのnext関数。
 * @throws {InvalidRefreshTokenError} - 有効なリフレッシュトークンが提供されない場合にスローされるエラー。
 * @returns {Object} 200 - ログアウトが正常に完了したことを示すレスポンス。
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    // リフレッシュトークンの存在確認
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }
    // パラメータのチェック
    ValidationParams(req.body, []);
    // usernameを取得
    const username = decodeItem(refreshToken, 'username', 'refresh');
    // リフレッシュトークンを削除
    await deleteRefreshToken(username);
    // Cookieを削除
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

/**
 * リフレッシュトークンを使用して新しい認証トークンを取得するエンドポイント。
 * クライアントが有効なリフレッシュトークンを持っている場合、新しい認証トークンが返されます。
 * 
 * @route POST /refresh
 * @param {Request} req - Expressのリクエストオブジェクト。
 * @param {Response} res - Expressのレスポンスオブジェクト。
 * @param {NextFunction} next - Expressのnext関数。
 * @throws {InvalidRefreshTokenError} - 有効なリフレッシュトークンが提供されない場合にスローされるエラー。
 * @returns {Object} 200 - 新しい認証トークンが正常に発行されたことを示すレスポンス。
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }
    // パラメータのチェック
    ValidationParams(req.body, []);
    // リフレッシュトークンの検証　＆　usernameの取得
    const username = decodeItem(refreshToken, 'username', 'refresh');
    // usernameからtokenの作成
    const token = jwt.sign({ username }, SECRET_KEY, {
      expiresIn: '15m',
    });
    // クッキーにトークンを保存
    res.cookie('authToken', token, { httpOnly: true });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

/**
 * リクエストが管理者かどうかをチェックするエンドポイント。
 *
 * @route GET /is-admin
 * @param {Object} req - Expressのリクエストオブジェクト。
 * @param {Object} res - Expressのレスポンスオブジェクト。
 * @param {function} next - Expressのミドルウェア関数。
 * @returns {Object} JSON - 管理者であるかどうかを示すブーリアン値を含むオブジェクト（例: { is_admin: true }）。
 * @throws {MyCustomError} TokenExpiredError - トークンが期限切れの場合にカスタムエラーをスローします。
 * @throws {Error} その他のエラーが発生した場合にエラーをスローします。
 */
router.get('/is-admin', async (req, res, next) => {
  try {
    const is_admin = await isAdmin(req);
    logger.debug(is_admin);
    res.json({ is_admin: is_admin });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      new MyCustomError('TokenExpiredError', 'token expired', 400);
    }
    next(error);
  }
});

exports.router = router;
