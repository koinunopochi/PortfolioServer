const { findAllUserData, deleteUser } = require('../models/user');
const {
  getRefreshToken,
  deleteRefreshToken,
} = require('../models/refreshToken');

const bcrypt = require('bcrypt');
const { MyCustomError } = require('../lib/CustomError');
const { firstCharUpp } = require('./util');
const { logger } = require('../lib/logger');

const ValidationError = require('../lib/CustomError').ValidationError;

/**
 * 入力されたパスワードが正しい形式であるかを検証します。
 * パスワードは、小文字、大文字、数字、特殊文字をそれぞれ1文字以上含み、
 * 全体として8〜128文字の長さである必要があります。
 *
 * @param {string} password - 検証するパスワード
 * @returns {boolean} パスワードが正しい形式である場合はtrue
 * @throws {ValidationError} パスワードが未定義、または不正な形式の場合
 */
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
 * 要素の値が存在しない場合にエラーを投げる関数
 * @param {string} value
 * @param {string} param1.errorName エラー名
 * @param {Number} param1.statusCode def 400,レスポンス用のHTTPステータスコード
 */
const throwErrorNotExist = (value, { paramName, statusCode = 400 }) => {
  const paramName_ = firstCharUpp(paramName);
  if (!isExist(value))
    throw new MyCustomError(
      `NotExist${paramName_}`,
      `Not exist ${paramName_}`,
      statusCode
    );
};
exports.throwErrorNotExist = throwErrorNotExist;

/**
 * 値が存在しているかを検証します
 * @param {*} value 値
 * @returns boolean
 */
const isExist = (value) => {
  if (value) return true;
  return false;
};

/**
 * 入力されたパスワードと保存されているパスワードが一致するかを検証します。
 * @param {string} inputPassword - 入力されたパスワード
 * @param {string} storedPassword - 保存されているパスワード
 * @throws {MyCustomError} パスワードが一致しない場合
 */
const validatePasswordMatch = async (inputPassword, storedPassword) => {
  const isPasswordValid = await bcrypt.compare(inputPassword, storedPassword);
  if (!isPasswordValid) {
    throw new MyCustomError('InvalidPassword', 'invalid password', 400);
  }
};

exports.validatePasswordMatch = validatePasswordMatch;

/**
 * ユーザーが認証済みかを検証します。
 * @param {Object} user - 検証するユーザーオブジェクト
 * @throws {MyCustomError} ユーザーが認証されていない場合
 */
const ensureUserVerified = (user) => {
  if (!user.is_verify) {
    throw new MyCustomError('InvalidUser', 'invalid user', 400);
  }
};

exports.ensureUserVerified = ensureUserVerified;

/**
 * 既存のリフレッシュトークンが存在する場合、それを削除します。
 * @param {string} username - リフレッシュトークンをチェックするユーザ名
 */
const handleExistingRefreshToken = async (username) => {
  const is_refresh_token = await getRefreshToken({ username });
  if (is_refresh_token) {
    await deleteRefreshToken({ username });
  }
};

exports.handleExistingRefreshToken = handleExistingRefreshToken;

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
  const user = await findAllUserData({ username });
  if (user && user.is_verify) {
    throw new MyCustomError('ExistUserError', 'email already exists', 400);
  } else if (user) {
    // 未認証のユーザーは削除する
    await deleteUser({ username });
  }
};

exports.checkExistingUser = checkExistingUser;

// ＃＃＃＃＃＃＃＃＃＃　reqのパラメータチェック　＃＃＃＃＃＃＃＃＃＃＃

/**
 * @function
 * @param {Object} params - チェックすべきパラメータが含まれるオブジェクト
 * @param {Array<string>} allowedParams - 許可されるパラメータの配列
 * @returns {boolean} - パラメータが有効な場合はtrueを返し、無効な場合はValidationErrorをスローします。
 * @throws {ValidationError} - 無効なパラメータが存在する場合にスローされます。
 * @description
 * この関数は、指定されたオブジェクト内のパラメータが許可されたパラメータリストに準拠しているかどうかをチェックします。
 * もし許可されていないパラメータがあれば、ValidationErrorをスローします。
 */
const allowingParams = (params, allowedParams) => {
  const receivedParams = Object.keys(params);
  const invalidParams = receivedParams.filter(
    (param) => !allowedParams.includes(param)
  );
  if (invalidParams.length > 0) {
    throw new ValidationError(
      `許可されていないパラメータです。: ${invalidParams.join(', ')}`
    );
  }
};
exports.allowingParams = allowingParams;

/**
 * 指定されたパラメータに値がない場合に、parmNameの値は必須であるというエラーを投げる
 * @param {*} param チェックしたい値
 * @param {string} paramName エラー時に出力する変数名
 */
const hasParam = (param, paramName, statusCode=400) => {
  if (!param) {
    throw new MyCustomError(
      'InvalidParameter',
      `${paramName}の値は必須です。`,
      statusCode
    );
  }
};

exports.hasParam = hasParam;

/**
 * 必須のパラメータがあるか、余計なパラメータがついていないかをチェックする関数
 * @param {*} param 検証したいパラメータ
 * @param {string} paramName 必須パラメータの変数名
 * @param {req.body} params リクエストのbody
 * @param {Array} allowed 必須パラメータの配列
 */
const validateParameters = (
  { param, paramName, statusCode },
  { params, allowed }
) => {
  hasParam(param, paramName, statusCode);
  allowingParams(params, allowed);
};

exports.validateParameters = validateParameters;

/**
 * リフレッシュtokenのバリデーションに関して統合的な処理を行う関数
 * @param {*} req リクエストをそのまま受け取る
 */
const validateParametersToRefreshToken = (req) => {
  const refreshToken  = req.cookies.refreshToken;
  validateParameters(
    { param: refreshToken, paramName: 'refreshToken', statusCode: 401 },
    { params: req.cookies, allowed: ['refreshToken'] },
  );
};
exports.validateParametersToRefreshToken = validateParametersToRefreshToken;

/**
 * 入力情報（ユーザ名とパスワード）を検証します。
 * @param {Object} param0 - ユーザ名とパスワードのオブジェクト
 * @param {string} param0.username - ユーザ名
 * @param {string} param0.password - パスワード
 * @throws {MyCustomError} ユーザ名が無効の場合
 */
const validateCredentials = ({ username, password }) => {
  hasParam({ param: username, paramName: 'username' });
  allowingParams({ username, password }, ['username', 'password']);
  ValidationPassword(password);
};

exports.validateCredentials = validateCredentials;
