const express = require('express');
const app = express();

const { logger } = require('./lib/logger');

const cors = require('cors');

const bodyParser = require('body-parser');

const { router: authRouter } = require('./router/auth');
const { MyCustomError } = require('./lib/custom_error');
const mongo = require('./lib/mongo');

app.use(cors());
app.use(bodyParser.json());

const server_port = process.env.PORT || 3000;

app.use('/auth', authRouter);

app.use((req, res) => {
  throw new MyCustomError('NotFound', 'Not found', 404);
});


/**
 * @route USE /* - すべてのルート
 * @group Error Handling - エラーハンドリング関連のエンドポイント
 * @param {Object} err - エラーオブジェクト
 * @param {express.Request} req - Expressのリクエストオブジェクト
 * @param {express.Response} res - Expressのレスポンスオブジェクト
 * @param {express.NextFunction} next - Expressのnext関数
 *
 * @returns {Object} 4xx, 5xx - エラーレスポンスJSONオブジェクトを含むレスポンスオブジェクト
 *
 * @description
 * このミドルウェアはAPIエラーハンドリングを行います。2種類のエラーを識別し処理します：
 * 1. MyCustomErrorのインスタンスとして想定されたエラー： エラー情報がログに記録され、クライアントにエラーの詳細がJSON形式で返されます。
 * 2. 想定外のエラー： エラーがログに記録され、500サーバーエラーとしてクライアントにJSON形式で返されます。
 *
 * エラーレスポンスのJSONオブジェクトは、タイムスタンプ、エラー名、エラーコード、エラーメッセージを含みます。
 */
app.use((err, req, res, next) => {
  const error_json = {
    error: {
      timestamp: new Date().toLocaleString(),
      name: err.name,
      code: err.statusCode,
      message: null,
    },
  };
  if (err instanceof MyCustomError) {
    // 想定内のエラーを処理
    logger.info(
      'called ' + err.name + ' ' + err.statusCode + ' ' + err.message
    );
    error_json.error.message = err.message;
    logger.info('finish error handling');
    return res.status(err.statusCode).json(error_json);
  } else {
    // 想定外のエラーを処理
    logger.error(err);
    logger.info('finish error handling');
    error_json.error.name = 'ServerError';
    error_json.error.code = 500;
    error_json.error.message = '500 Server Error';
    res.status(500).send(error_json);
  }
});

mongo
  .connect()
  .then(async () => {
    //初期化用のコード
    await mongo.init();
  })
  .then(() => {
    app.listen(server_port, () => {
      logger.info(`Server is listening on port ${server_port}`);
    });
  })
  .catch((err) => {
    logger.error(err);
  });
