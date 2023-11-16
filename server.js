const express = require('express');
const app = express();

const { logger } = require('./lib/logger');

const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { router: authRouter, registerUser } = require('./router/auth');
const { router: blogRouter } = require('./router/blog');
const { router: contactRouter } = require('./router/contact');
const { router: accessRouter } = require('./router/access');

const { MyCustomError } = require('./lib/CustomError');
const mongo = require('./lib/mongo');
const { accessLog } = require('./utils/accessLog');
const { getUserAll } = require('./models/user');

const SERVER_PORT = process.env.PORT || 3000;

// TODO: 本番環境では、許可するオリジンを厳密に指定する
const corsOptions = {
  origin: 'http://localhost:5173', // クライアントのオリジン
  credentials: true, // クレデンシャル（Cookie）を許可
};

app.use(cors(corsOptions));

app.use(accessLog);
app.use(bodyParser.json());
app.use(cookieParser());

// router
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/contact', contactRouter);
app.use('/access', accessRouter);
// not found
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
    error_json.error.name = 'ServerError';
    error_json.error.code = 500;
    error_json.error.message = '500 Server Error';
    res.status(500).send(error_json);
    logger.info('finish error handling');
  }
});

mongo
  .connect().then(
    logger.info("MongoDB connect success!!!")
  )
  .then(async () => {
    //初期化用のコード
    await mongo.init();
  })
  .then(async() => {
    // adminの初期化
    const AUTH_USER_NAME = process.env.AUTH_USER_NAME;
    const AUTH_USER_PASSWORD = process.env.AUTH_USER_PASSWORD;
    const user = await getUserAll(AUTH_USER_NAME);
    if (!user) {
      await registerUser(AUTH_USER_NAME, AUTH_USER_PASSWORD, 'admin');
    }
  })
  .then(() => {
    app.listen(SERVER_PORT, () => {
      logger.info(`Server is listening on port ${SERVER_PORT}`);
    });
  })
  .catch((err) => {
    logger.error(err);
  });
