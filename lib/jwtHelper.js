const jwt = require('jsonwebtoken');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const AUTH_TOKEN_TIME = process.env.AUTH_TOKEN_TIME;
const REFRESH_TOKEN_TIME = process.env.REFRESH_TOKEN_TIME;

// 環境固有の .env ファイルの読み込み
const envPath = `.env.${process.env.NODE_ENV}`;
require('dotenv').config({ path: envPath });

const crypto = require('crypto');
const { MyCustomError, AuthenticationError } = require('../lib/CustomError');

/**
 * JWTトークンをデコードし、指定されたアイテム（デフォルトは'email'）を取得します。
 *
 * @function
 * @param {string} token - デコードするJWTトークン。
 * @param {string} - トークンから取得する項目のキー。
 * @param {string} - トークンの検証に使用するキー。
 * @returns {string} デコードされたアイテムの値。
 * @throws トークンの検証に失敗した場合、エラーがスローされます。
 */
const decodeItem = (token, item, key) => {
  try {
    if (!token) {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    if (!item || !key) {
      throw new Error('item または key が設定されていません。');
    }

    // トークンを検証してデコードする
    const decoded = jwt.verify(token, key);

    if (!decoded[item]) {
      throw new Error('itemの値が不正です。');
    }
    // 指定されたアイテムの値を返す
    return decoded[item];
  } catch (error) {
    if (error.message === 'jwt expired') {
      throw new AuthenticationError();
    }
    if (error.message === 'jwt malformed') {
      throw Error('トークンが誤っています。');
    }
    throw error;
  }
};
exports.decodeItem = decodeItem;

/**
 * 32バイトのランダムなキーを生成します。
 *
 * @function
 * @returns {void} 生成されたキーはコンソールにログとして表示されます。
 */
const generateKey = () => {
  // 32バイトのランダムなキーを生成
  const key = crypto.randomBytes(32).toString('hex');
  console.log(key);
  return key;
};
// generateKey();
exports.generateKey = generateKey;

/**
 * 指定されたユーザー名に基づいてJWTとリフレッシュトークンを生成します。
 *
 * JWTの有効期限は15分、リフレッシュトークンの有効期限は7日です。
 *
 * @param {string} username - トークンのペイロードに含めるユーザー名
 * @returns {object} 生成されたトークンを含むオブジェクト。形式：{ token, refreshToken }
 */
const generateTokens = (username) => {
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: AUTH_TOKEN_TIME });
  const refreshToken = jwt.sign({ username }, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_TIME,
  });
  return { token, refreshToken };
};

exports.generateTokens = generateTokens;
