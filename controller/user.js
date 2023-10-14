// const { getDb } = require('../lib/mongo');
// const { MyCustomError } = require('../lib/custom_error');
const { logger } = require('../lib/logger');
const { getCollection } = require('./db_utils');

const DbOperations = require('./DbOperations');

const userOperations = new DbOperations('users');
const refreshTokenOperations = new DbOperations('refresh_tokens');

// ###################  insert周り  ################################
/**
 * ユーザー登録のための関数
 * @param {string} username ユーザー名
 * @param {string} hashed_password ハッシュ化されたパスワード
 * @param {string} token メール認証用のトークン
 * @param {boolean} is_verify メール認証が終わっているかどうか
 * @param {string} role adminかuserか
 * @returns insertした結果を表示
 */
const insertUser = async (username, hashed_password, token, is_verify, role) => {
  return await userOperations.insert({
    username,
    password:hashed_password,
    token,
    is_verify,
    role,
  });
};
exports.insertUser = insertUser;
/**
 * 指定したユーザーにリフレッシュトークンを付与する関数
 * @param {string} username ユーザー名
 * @param {string} refresh_token リフレッシュ用のトークン
 * @returns insert結果を返す
 */
const insertRefreshToken = async (username, refresh_token) => {
  return await refreshTokenOperations.insert({
    username,
    refresh_token,
  });
};
exports.insertRefreshToken = insertRefreshToken;

/**
 * ユーザーに関する情報をすべて取得する関数
 * @param {string} username ユーザー名
 * @returns getで得た結果を返す
 */
const getUserAll = async (username) => {
  return await userOperations.findOne(username);
};
exports.getUserAll = getUserAll;


// ###################  get周り  ################################
/**
 * リフレッシュトークンの取得
 * @param {string} username 
 * @returns 取得した結果を返す
 */
const getRefreshToken = async (username) => {
  return await refreshTokenOperations.findOne(username, {
    _id: 0,
    refresh_token: 1,
  });
};
exports.getRefreshToken = getRefreshToken;

// ###################  delete周り  ################################
/**
 * リフレッシュトークンの削除
 * @param {string} username 
 * @returns 結果を返す
 */
const deleteRefreshToken = async (username) => {
  return await refreshTokenOperations.delete({ username });
};
exports.deleteRefreshToken = deleteRefreshToken;

/**
 * ユーザーの削除を行う
 * @param {string} username 
 * @returns 
 */
const deleteUser = async (username) => {
  const collection = await getCollection('users');
  const result = await collection.deleteOne({ username });
  return result;
};
exports.deleteUser = deleteUser;

// ###################  update周り  ################################

// 未使用
/**
 * ユーザー情報をアップデートする
 * 詳細不明
 * コードから、ユーザーをターゲットjsonの中に入っている情報でアップデートする
 * @param {JSON} primary_json 
 * @param {JSON} target_json 
 * @returns 
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

/**
 * ユーザーのアクセス数を変更する
 * @param {string} username ユーザー名
 * @returns 
 */
const updateAccessNum = async (username) => {
  const collection = await getCollection('users');
  const result = await collection.updateOne(
    { username },
    { $inc: { access_num: 1 } }
  );
  return result;
};
exports.updateAccessNum = updateAccessNum;
