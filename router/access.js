const express = require('express');
const router = express.Router();

const { logger } = require('../lib/logger');
const { findAccessLogs } = require('../models/accessLog');
const { admin_route } = require('../utils/adminRoute');

const { validateParameters } = require('../utils/validate');

/**
 * GET / - アクセスログを取得します
 *
 * このエンドポイントは指定された期間のアクセスログを取得するために使用します。
 * `start` パラメータは必須で、`end` パラメータはオプションです。
 * レスポンスとして、指定された期間中のアクセスログのJSONを返します。
 *
 * @route {GET} /
 * @param {string} start - ログを取得開始する日時（必須）
 * @param {string} end - ログを取得終了する日時（オプショナル）
 * @middleware {function} admin_route - 管理者のみアクセスを許可するミドルウェア
 * @throws {MyCustomError} - `start` パラメータが不在の場合、カスタムエラーをスロー
 */
router.get('/', admin_route, async (req, res, next) => {
  try {
    const { start, end } = req.query;

    logger.info(req.query);

    validateParameters(
      {
        param: start,
        paramName: 'start',
      },
      { params: req.query, allowed: ['start'] }
    );

    // アクセスログを取得します
    const result = await findAccessLogs({
      startTime: start,
      endTime: end || new Date(),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

exports.router = router;
