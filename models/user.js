const { logger } = require('../lib/logger');

const DbOperations = require('../lib/DbOperations');

const userOperations = new DbOperations('users');
// const refreshTokenOperations = new DbOperations('refresh_tokens');

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
const insertUser = async (
  username,
  hashed_password,
  token,
  is_verify,
  role
) => {
  return await userOperations.insert({
    username,
    password: hashed_password,
    token,
    is_verify,
    role,
  });
};
exports.insertUser = insertUser;

// ###################  get周り  ################################

/**
 * ユーザーに関する情報をすべて取得する関数
 * @param {string} username ユーザー名
 * @returns getで得た結果を返す
 */
const getUserAll = async (username) => {
  const result = await userOperations.findOne({ username });
  logger.debug(result);
  return result;
};
exports.getUserAll = getUserAll;

/**
 * すべてのusernameとroleを取得する関数
 * @returns getで得た結果を返す
 */
const getUsernamesRoles = async () => {
  // usernameが一意の値であるため、_idは取得しない
  return await userOperations.find(
    {},
    { projection: { username: 1, role: 1, _id: 0 } }
  );
};
exports.getUsernamesRoles = getUsernamesRoles;

// ###################  delete周り  ################################
/**
 * ユーザーの削除を行う
 * @param {string} username
 * @returns
 */
const deleteUser = async (username) => {
  const result = await userOperations.delete({ username });
  return result;
};
exports.deleteUser = deleteUser;

// ###################  update周り  ################################
/**
 * ユーザーのアクセス数を変更する
 * @param {string} username ユーザー名
 * @returns
 */
const updateAccessNum = async (username) => {
  return await userOperations.update({ username }, { $inc: { access_num: 1 } });
};
exports.updateAccessNum = updateAccessNum;
