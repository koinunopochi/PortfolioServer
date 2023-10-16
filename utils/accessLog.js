const { insertAccessLog } = require('../controller/accessLog');
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
    // IPアドレスの取得
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // HTTPメソッドの取得
    const method = req.method;
    // アクセスされたURLの取得
    const url = req.url;
    // アクセス時刻の取得
    const time = new Date();

    // ログにアクセス情報を出力
    logger.info(`${ip} - ${time} - ${method} - ${url}`);

    // データベースにアクセスログを挿入
    await insertAccessLog(ip, method, url, time);

    // 次のミドルウェア/ルートハンドラーへ移行
    next();
  } catch (error) {
    // エラーハンドリングミドルウェアへエラーオブジェクトを渡す
    next(error);
  }
};

exports.accessLog = accessLog;
