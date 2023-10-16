const ValidationError = require('../lib/CustomError').ValidationError;

const ValidationPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-\/:-@\[-`{-~])[!-~]{8,128}$/;

  if (password === undefined) {
    throw new ValidationError('password is not defined');
  } else if (passwordRegex.test(password)) {
    return true;
  } else {
    throw new ValidationError('password is not correct');
  }
};
exports.ValidationPassword = ValidationPassword;

/**
 * @function
 * @param {Object} params - チェックすべきパラメータが含まれるオブジェクト
 * @param {Array<string>} allowedParams - 許可されるパラメータの配列
 *
 * @returns {boolean} - パラメータが有効な場合はtrueを返し、無効な場合はValidationErrorをスローします。
 *
 * @throws {ValidationError} - 無効なパラメータが存在する場合にスローされます。
 *
 * @description
 * この関数は、指定されたオブジェクト内のパラメータが許可されたパラメータリストに準拠しているかどうかをチェックします。
 * もし許可されていないパラメータがあれば、ValidationErrorをスローします。それ以外の場合は、trueを返します。
 */
const ValidationParams = (params, allowedParams) => {
  // const allowedParams = ['model', 'prompt'];
  const receivedParams = Object.keys(params);
  const invalidParams = receivedParams.filter(
    (param) => !allowedParams.includes(param)
  );
  if (invalidParams.length > 0) {
    throw new ValidationError(`Invalid params: ${invalidParams.join(', ')}`);
  } else {
    return true;
  }
};
exports.ValidationParams = ValidationParams;

const {
  getUserAll,
  insertRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  updateAccessNum,
  deleteUser,
} = require('../controller/user');

require('dotenv').config();
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

const bcrypt = require('bcrypt');
const e = require('express');

const jwt = require('jsonwebtoken');

const validateLoginCredentials = ({ username, password }) => {
  ValidationParams({ username, password }, ['username', 'password']);

  if (username == '') {
    throw new MyCustomError('InvalidUsername', 'invalid username', 400);
  }
  ValidationPassword(password);
};

exports.validateLoginCredentials = validateLoginCredentials;

const validateUserExistence = async (user) => {
  if (!user) {
    throw new MyCustomError('NotExistUser', 'not exist user', 400);
  }
};

exports.validateUserExistence = validateUserExistence;

const validatePasswordMatch = async (inputPassword, storedPassword) => {
  const isPasswordValid = await bcrypt.compare(inputPassword, storedPassword);
  if (!isPasswordValid) {
    throw new MyCustomError('InvalidPassword', 'invalid password', 400);
  }
};

exports.validatePasswordMatch = validatePasswordMatch;

const ensureUserVerified = (user) => {
  if (!user.is_verify) {
    throw new MyCustomError('InvalidUser', 'invalid user', 400);
  }
};

exports.ensureUserVerified = ensureUserVerified;

const handleExistingRefreshToken = async (username) => {
  const is_refresh_token = await getRefreshToken(username);
  if (is_refresh_token) {
    await deleteRefreshToken(username);
  }
};

exports.handleExistingRefreshToken = handleExistingRefreshToken;

const generateTokens = (username) => {
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username }, REFRESH_SECRET_KEY, {
    expiresIn: '7d',
  });
  return { token, refreshToken };
};

exports.generateTokens = generateTokens;

// 仮置き
// TODO：　ヴァリデーション以外のことも入ってしまっているため、分ける
const loginUser = async (username, password) => {
  validateLoginCredentials({ username, password });

  const user = await getUserAll(username);
  validateUserExistence(user);
  validatePasswordMatch(password, user.password);
  ensureUserVerified(user);
  handleExistingRefreshToken(username);

  const { token, refreshToken } = generateTokens(username);
  await insertRefreshToken(username, refreshToken);
  await updateAccessNum(username);

  return { token, refreshToken };
};

exports.loginUser = loginUser;

/**
 * サインアップリクエストのパラメータを検証します。
 *
 * @function
 * @name validateSignupRequest
 * @param {Object} params ユーザーパラメータ
 * @param {string} params.username サインアップするユーザーのユーザー名
 * @param {string} params.password サインアップするユーザーのパスワード
 * @throws {MyCustomError} パラメータが無効な場合にカスタムエラーを投げます
 */
const validateSignupRequest = ({ username, password }) => {
  ValidationParams({ username, password }, ['username', 'password']);
  if (username === '') {
    throw new MyCustomError('InvalidUsername', 'invalid username', 400);
  }
  ValidationPassword(password);
};

exports.validateSignupRequest = validateSignupRequest;

/**
 * 既存のユーザーを確認し、該当するユーザーが存在する場合は削除します。
 *
 * @function
 * @name checkExistingUser
 * @async
 * @param {string} username 検証するユーザー名
 * @throws {MyCustomError} 有効なユーザーが既に存在する場合にカスタムエラーを投げます
 * @returns {Promise<void>}
 */
const checkExistingUser = async (username) => {
  const user = await getUserAll(username);
  if (user && user.is_verify) {
    throw new MyCustomError('ExistUserError', 'email already exists', 400);
  } else if (user) {
    // 未認証のユーザーは削除する
    await deleteUser(username);
  }
};

exports.checkExistingUser = checkExistingUser;
