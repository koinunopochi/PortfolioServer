const express = require('express');
const app = express();

const { logger } = require('./lib/logger');

const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { router: authRouter } = require('./router/auth');
const { router: blogRouter } = require('./router/blog');
const { router: contactRouter } = require('./router/contact');
const { router: accessRouter } = require('./router/access');

const { MyCustomError } = require('./lib/custom_error');
const mongo = require('./lib/mongo');
const { accessLog } = require('./lib/access_log');

const corsOptions = {
  origin: 'http://localhost:5173', // クライアントのオリジン
  credentials: true, // クレデンシャル（Cookie）を許可
};

app.use(cors(corsOptions));

app.use(accessLog);
app.use(bodyParser.json());
app.use(cookieParser());

const server_port = process.env.PORT || 3000;

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.url);
  next();
});
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/contact', contactRouter);
app.use("/access", accessRouter);

app.use((req, res) => {
  throw new MyCustomError('NotFound', 'Not found', 404);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
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
