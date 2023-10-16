const express = require('express');
const router = express.Router();

const { logger } = require('../lib/logger');

const { MyCustomError } = require('../utils/custom_error');
const { getAccessLogs } = require('../controller/access_log');
const { admin_route } = require('../utils/admin_route');

/**
 * GET / - アクセスログを取得します
 *
 * このエンドポイントは指定された期間のアクセスログを取得するために使用します。
 * `start` パラメータは必須で、`end` パラメータはオプションです。
 * レスポンスとして、指定された期間中のアクセスログのJSONを返します。
 *
 * @route {GET} /
 * @queryparam {string} start - ログを取得開始する日時（必須）
 * @queryparam {string} end - ログを取得終了する日時（オプショナル）
 * @middleware {function} admin_route - 管理者のみアクセスを許可するミドルウェア
 * @throws {MyCustomError} - `start` パラメータが不在の場合、カスタムエラーをスロー
 */
router.get('/', admin_route, async (req, res, next) => {
  try {
    // クエリパラメータを取得します
    const { start } = req.query;
    let { end } = req.query;

    // クエリパラメータをログに出力します
    logger.info(req.query);

    // startパラメータが不在の場合、カスタムエラーをスローします
    if (!start) {
      throw new MyCustomError('InvalidStartTime', 'startの値は必須です。', 400);
    }

    // endパラメータが不在の場合、現在の日時をデフォルト値とします
    if (!end) {
      end = new Date();
    }

    // アクセスログを取得します
    const result = await getAccessLogs(start, end);

    // 取得したログをJSONとしてレスポンスに含めます
    res.status(200).json(result);
  } catch (error) {
    // エラーハンドリングミドルウェアにエラーオブジェクトを渡します
    next(error);
  }
});

// ルーターをエクスポートします
exports.router = router;
