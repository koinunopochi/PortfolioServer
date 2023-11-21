// const { logger } = require('../lib/logger');
const { logger } = require('../lib/logger');
const { getDb } = require('../lib/mongo');
const DbOperations = require('../lib/DbOperations');

let refreshTokenOperations;
getDb().then((db) => {
  refreshTokenOperations = new DbOperations(db, 'refresh_tokens');
  logger.info('MongoDB create new [refresh_tokens] instance');
});
// const refreshTokenOperations = new DbOperations('refresh_tokens');

/**
 * 指定したユーザーにリフレッシュトークンを付与する関数
 * @param {string} username ユーザー名
 * @param {string} refresh_token リフレッシュ用のトークン
 * @returns insert結果を返す
 */
const insertRefreshToken = async ({username, refresh_token}) => {
  return await refreshTokenOperations.insert({
    username,
    refresh_token,
  });
};
exports.insertRefreshToken = insertRefreshToken;

/**
 * リフレッシュトークンの取得
 * @param {string} username
 * @returns 取得した結果を返す
 */
const getRefreshToken = async ({username}) => {
  return await refreshTokenOperations.findOne(
    { username },
    {
      _id: 0,
      refresh_token: 1,
    }
  );
};
exports.getRefreshToken = getRefreshToken;

/**
 * リフレッシュトークンの削除
 * @param {string} username
 * @returns 結果を返す
 */
const deleteRefreshToken = async ({username}) => {
  return await refreshTokenOperations.delete({ username });
};
exports.deleteRefreshToken = deleteRefreshToken;
