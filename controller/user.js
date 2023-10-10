const { getDb } = require('../lib/mongo');
const { MyCustomError } = require('../lib/custom_error');
const { logger } = require('../lib/logger');
const { getCollection } = require('./db_utils');

const DbOperations = require('./DbOperations');

const userOperations = new DbOperations('users');
const refreshTokenOperations = new DbOperations('refresh_tokens');

const insertUser = async (username, password, token, is_verify, role) => {
  return await userOperations.insert({
    username,
    password,
    token,
    is_verify,
    role,
  });
};
exports.insertUser = insertUser;

/**
 * 新しいユーザーをデータベースに追加します。
 *
 * @function
 * @async
 * @param {string} email - 新しいユーザーのメールアドレス
 * @param {string} password - 新しいユーザーのハッシュ化されたパスワード
 * @param {string} token - メールアドレス確認用のトークン
 * @param {boolean} is_verify - ユーザーのメールアドレスが確認されたかどうかを示すフラグ
 * @param {string} role - ユーザーの役割（例：admin, user など）
 *
 * @returns {Promise<Object>} - MongoDBからの挿入結果
 *
 * @throws {MyCustomError} - emailがすでに存在する場合のエラー
 *
 * @example
 * try {
 *   const result = await insertUser('test@example.com', 'hashedPassword123', 'verificationToken456', false, 'user');
 *   console.log(result);
 * } catch (error) {
 *   console.error(error);
 * }
 */

// const insertUser = async (username, password, token, is_verify, role) => {
//   const collection = await getCollection('users');
//   const result = await collection
//     .insertOne({ username, password, token, is_verify, role })
//     .catch((err) => {
//       throw err;
//     });
//   return result;
// };

const getRefreshToken = async (username) => {
const collection = await getCollection('refresh_tokens');
  const result = await collection.findOne(
    { username },
    { projection: { _id: 0, refresh_token: 1 } }
  );
  return result;
};
exports.getRefreshToken = getRefreshToken;

const insertRefreshToken = async (username, refresh_token) => {
const collection = await getCollection('refresh_tokens');
  const result = await collection.insertOne({ username, refresh_token });
  return result;
};
exports.insertRefreshToken = insertRefreshToken;

const deleteRefreshToken = async (username) => {
const collection = await getCollection('refresh_tokens');
  const result = await collection.deleteOne({ username });
  return result;
};
exports.deleteRefreshToken = deleteRefreshToken;

/**
 * 選択したユーザー情報をデータベースから削除します。
 *
 * @function
 * @async
 * @param {Object} primary_json - ユーザーを識別するためのJSONオブジェクト。通常はユーザーのemailを含みます。
 * @returns {Promise<Object>} - MongoDBのdeleteOneメソッドからの戻り値。削除操作の結果を含みます。
 *
 * @throws {MongoDBError} - データベースアクセス中にエラーが発生した場合にスローされる可能性があります。
 *
 * @example
 * // ユーザーをメールアドレスで指定して削除
 * deleteUser({ email: 'user@example.com' })
 *   .then(result => console.log(result))
 *   .catch(err => console.error(err));
 */
const deleteUser = async (primary_json) => {
  const collection = await getCollection('users');
  const result = await collection.deleteOne(primary_json);
  return result;
};
exports.deleteUser = deleteUser;

/**
 * @function
 * @async
 * @param {Object} json - ユーザー情報を検索するためのクエリパラメータを含むJSONオブジェクト
 *
 * @returns {Object} - データベースから取得したユーザーの情報オブジェクト。メールが見つからない場合は、カスタムエラーをスローします。
 *
 * @throws {MyCustomError} - メールがデータベースに見つからない場合にスローされるカスタムエラー。
 *
 * @description
 * この関数は、与えられたJSONクエリパラメータを使用してデータベースからユーザー情報を取得します。
 * ユーザー情報が見つからない場合は、カスタムエラーをスローします。
 */
const getUserInfo = async (username) => {
  const collection = await getCollection('users');
  const user = await collection.findOne(username);
  // logger.debug(user);
  // if (user === null) {
  //   throw new MyCustomError('NotFoundEmailError', 'email not found', 400);
  // }
  return user;
};
exports.getUserInfo = getUserInfo;

/**
 * @function
 * @async
 * @param {Object} primary_json - ユーザー情報を識別するためのクエリパラメータを含むJSONオブジェクト（例：emailや_idなど）
 * @param {Object} target_json - データベース内のユーザー情報を更新するための新しいデータを含むJSONオブジェクト
 *
 * @returns {Object} - MongoDBのupdateOneメソッドからの戻り値。更新が成功した場合の結果オブジェクトを含みます。
 *
 * @description
 * この関数はデータベース内の特定のユーザー情報を更新します。最初のパラメータ（primary_json）を使用して特定のユーザーを識別し、
 * 2つ目のパラメータ（target_json）を使用してそのユーザーのデータを更新します。更新が成功した場合、結果オブジェクトを返します。
 */
const updateUser = async (primary_json, target_json) => {
  const collection = await getCollection('users');
  logger.debug(target_json);
  const result = await collection.updateOne(primary_json, {
    $set: target_json,
  });
  logger.debug(result);
  return result;
};
exports.updateUser = updateUser;

const updateAccessNum = async (username) => {
  const collection = await getCollection('users');
  const result = await collection.updateOne(
    { username },
    { $inc: { access_num: 1 } }
  );
  return result;
};

exports.updateAccessNum = updateAccessNum;
