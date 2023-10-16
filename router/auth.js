const express = require('express');
const {
  MyCustomError,
  InvalidRefreshTokenError,
} = require('../lib/CustomError');
const {
  ValidationParams,
  validateSignupRequest,
  checkExistingUser,
  validateLoginCredentials,
  validateUserExistence,
  validatePasswordMatch,
  ensureUserVerified,
  handleExistingRefreshToken,
} = require('../utils/validate');
const {
  deleteRefreshToken,
  insertUser,
  getUserAll,
  insertRefreshToken,
  updateAccessNum,
} = require('../controller/user');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { logger } = require('../lib/logger');
const { admin_route, isAdmin } = require('../utils/adminRoute');
const { decodeItem, generateTokens } = require('../lib/jwtHelper');

require('dotenv').config();
const { SECRET_KEY } = process.env;
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * ユーザー名とパスワードを受け取り、ユーザーを登録します。
 *
 * この関数は以下の手順を実行します：
 * 1. パスワードをハッシュ化します。
 * 2. 認証トークンを生成します。
 * 3. ユーザー情報をデータベースに保存します。
 *
 * @param {string} username - 登録するユーザー名
 * @param {string} password - ユーザーの生のパスワード
 * @returns {Promise<object>} 登録したユーザーの情報
 * @throws 保存中のエラーが発生した場合
 */
const registerUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(16).toString('hex');
  return await insertUser(
    username,
    hashedPassword,
    verificationToken,
    true,
    'user'
  );
};

/**
 * 新しいユーザーをサインアップします。
 *
 * @function
 * @async
 * @name signUp
 * @route {POST} /signup
 * @middleware admin_route 管理者権限が必要
 * @param {Request} req Expressのリクエストオブジェクト
 * @param {Object} req.body リクエストのボディ
 * @param {string} req.body.username サインアップするユーザーのユーザー名
 * @param {string} req.body.password サインアップするユーザーのパスワード
 * @param {Response} res Expressのレスポンスオブジェクト
 * @param {function} next Expressのミドルウェア関数
 * @returns {Response} 成功メッセージとHTTPステータス200を返します。
 * @throws エラーが発生した場合は、エラーを次のミドルウェア関数に渡します。
 */
router.post('/signup', admin_route, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    validateSignupRequest({ username, password });
    await checkExistingUser(username);
    await registerUser(username, password);

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

/**
 * ユーザー名とパスワードを受け取り、ユーザーを認証してJWTとリフレッシュトークンを生成します。
 *
 * この関数は以下の手順を実行します：
 * 1. ログインの資格情報を検証します。
 * 2. ユーザーの存在を検証します。
 * 3. 入力されたパスワードが保存されているパスワードと一致するか検証します。
 * 4. ユーザーが認証済みであることを確認します。
 * 5. 既存のリフレッシュトークンがあれば処理します。
 * 6. JWTとリフレッシュトークンを生成します。
 * 7. リフレッシュトークンをDBに保存します。
 * 8. ユーザーのアクセス回数を更新します。
 *
 * @param {string} username - ユーザー名
 * @param {string} password - パスワード
 * @returns {object} 生成されたトークンを含むオブジェクト。形式：{ token, refreshToken }
 * @throws {MyCustomError} ユーザーが存在しない、パスワードが一致しない、ユーザーが認証済みでない場合にエラーを投げます。
 */
const loginUser = async (username, password) => {
  try {
    validateLoginCredentials({ username, password });

    const user = await getUserAll(username);
    validateUserExistence(user);
    await validatePasswordMatch(password, user.password);
    ensureUserVerified(user);
    await handleExistingRefreshToken(username);

    const { token, refreshToken } = generateTokens(username);
    await insertRefreshToken(username, refreshToken);
    await updateAccessNum(username);

    return { token, refreshToken };
  } catch(error) {
    throw error;
  }
};

/**
 * @route POST /login
 * @group User - ユーザーの操作に関するエンドポイント
 * @param {string} username.body.required - ユーザー名
 * @param {string} password.body.required - パスワード
 * @returns {object} 200 - ログイン成功時のレスポンス
 * @returns {Error} 400 - 無効なユーザー名、パスワード、またはその他のエラー
 * @returns {Error} 401 - 認証に関するエラー
 * @security JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { token, refreshToken } = await loginUser(username, password);
    // クッキーにトークンを保存
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
    });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
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
