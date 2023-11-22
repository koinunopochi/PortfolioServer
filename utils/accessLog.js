const { insertAccessLog } = require('../models/accessLog');
const { logger } = require('../lib/logger');

/**
 * アクセスログのミドルウェア。
 *
 * このミドルウェアは、APIへのアクセス情報をログに記録し、データベースに保存します。
 * 保存される情報は以下の通りです：
 * - IPアドレス
 * - HTTPメソッド
 * - アクセスされたURL
 * - アクセス時刻
 *
 * @function
 * @async
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @param {function} next - 次のミドルウェアまたはルートハンドラーへのコールバック関数
 * @throws 何らかのエラーが発生した場合、エラーハンドリングミドルウェアにエラーオブジェクトが渡されます
 */
const accessLog = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const url = req.url;
    const time = new Date();

    // ログにアクセス情報を出力
    logger.info(`${ip} - ${time} - ${method} - ${url}`);

    // データベースにアクセスログを挿入
    await insertAccessLog({ip, method, url, time});
    next();
  } catch (error) {
    next(error);
  }
};

exports.accessLog = accessLog;
