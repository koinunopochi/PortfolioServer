const { getDb } = require('../lib/mongo');
const { MyCustomError } = require('../lib/custom_error');
const { logger } = require('../lib/logger');

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

const insertUser = async (email, password, token, is_verify, role) => {
  const db = getDb();
  const collection = db.collection('users');
  const result = await collection
    .insertOne({ email, password, token, is_verify, role })
    .catch((err) => {
      throw err;
    });
  return result;
};
exports.insertUser = insertUser;

const getRefreshToken = async (email) => {
  const db = getDb();
  const collection = db.collection('refresh_tokens');
  const result = await collection.findOne(
    { email },
    { projection: { _id: 0, refresh_token: 1 } }
  );
  return result;
};
exports.getRefreshToken = getRefreshToken;

const insertRefreshToken = async (email, refresh_token) => {
  const db = getDb();
  const collection = db.collection('refresh_tokens');
  const result = await collection.insertOne({ email, refresh_token });
  return result;
};
exports.insertRefreshToken = insertRefreshToken;

const deleteRefreshToken = async (email) => {
  const db = getDb();
  const collection = db.collection('refresh_tokens');
  const result = await collection.deleteOne({ email });
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
  const db = getDb();
  const collection = db.collection('users');
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
const getUserInfo = async (json) => {
  const db = getDb();
  const collection = db.collection('users');
  logger.debug('getUserInfo:' + json);
  const user = await collection.findOne(json);
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
  const db = getDb();
  const collection = db.collection('users');
  logger.debug(target_json);
  const result = await collection.updateOne(primary_json, {
    $set: target_json,
  });
  logger.debug(result);
  return result;
};
exports.updateUser = updateUser;
