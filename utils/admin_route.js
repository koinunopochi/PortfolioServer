const { getUserAll } = require('../controller/user');
const { MyCustomError } = require('./custom_error');
const { logger } = require('../lib/logger');
const { decodeItem } = require('../lib/jwtHelper');

/**
 * 管理者のみがアクセスを許可されたルートを保護するためのミドルウェア。
 *
 * @function
 * @async
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @param {function} next - 次のミドルウェアまたはルートハンドラーへのコールバック関数
 * @throws 何らかのエラーが発生した場合、エラーハンドリングミドルウェアにエラーオブジェクトが渡されます
 */
const protect = async (req, res, next) => {
  try {
    // 管理者かどうかを確認する
    const is_admin = await isAdmin(req);
    // ユーザーが管理者でない場合はエラーを投げる
    if (is_admin !== true) {
      throw new MyCustomError('InvalidUser', 'invalid user', 400);
    }
    next();
  } catch (error) {
    // トークンの有効期限が切れている場合はエラーを投げる
    if (error.name === 'TokenExpiredError') {
      next(new MyCustomError('TokenExpiredError', 'token expired', 400));
    }
    next(error);
  }
};
exports.admin_route = protect;

/**
 * 管理者であるかどうかを判断する関数。
 *
 * @function
 * @async
 * @param {Object} req - Expressのリクエストオブジェクト
 * @returns {boolean} 管理者であればtrue、それ以外はfalse
 * @throws 何らかのエラーが発生した場合はエラーがスローされます
 */
const isAdmin = async (req) => {
  try {
    const cookie = req.cookies.authToken;
    // トークンからユーザー名をデコードする
    const username = decodeItem(cookie, 'username');

    // ユーザー情報を取得
    const userInfo = await getUserAll(username);
    logger.debug(userInfo.role);

    // ユーザーが管理者であればtrueを返す
    if (userInfo.role === 'admin') {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};
exports.isAdmin = isAdmin;
