const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const { logger } = require('./logger');
const crypto = require('crypto');
const { MyCustomError } = require('../lib/CustomError');

/**
 * JWTトークンをデコードし、指定されたアイテム（デフォルトは'email'）を取得します。
 *
 * @function
 * @param {string} token - デコードするJWTトークン。
 * @param {string} [item="email"] - トークンから取得する項目のキー。
 * @param {string} [key=SECRET_KEY] - トークンの検証に使用するキー。もしくは'refresh'を指定すると、リフレッシュトークン用のキーが使用されます。
 * @returns {string} デコードされたアイテムの値。
 * @throws トークンの検証に失敗した場合、エラーがスローされます。
 */
const decodeItem = (token, item = 'email', key = SECRET_KEY) => {
  if (!token) {
    throw new MyCustomError('InvalidUser', 'invalid user', 400);
  }
  if (key == 'refresh') {
    key = REFRESH_SECRET_KEY;
  }
  // トークンを検証してデコードする
  const decoded = jwt.verify(token, key);
  logger.debug(decoded);

  // 指定されたアイテムの値を返す
  return decoded[item];
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
};
// generateKey();
exports.generateKey = generateKey;
