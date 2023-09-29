const { MongoClient } = require('mongodb');
const { logger } = require('./logger');
require('dotenv').config();

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGO_DBNAME || 'PortfolioDB';

let db = null;

/**
 * MongoDBに接続します。
 * 
 * @function connect
 * @async
 * @returns {Promise<Db>} - 接続されたMongoDBのデータベースインスタンスを返します。
 * 
 * @description
 * この関数は、指定されたURLを使用してMongoDBサーバーに非同期で接続し、
 * データベースインスタンスへの参照を設定します。 
 * 接続が成功すると、ログに接続成功メッセージが記録されます。
 */
const connect = async () => {
  const client = await MongoClient.connect(url);
  db = client.db(dbName);
  logger.info('MongoDB connected :::' + dbName);
  return db;
};
exports.connect = connect;
/**
 * 現在のMongoDBデータベースインスタンスを取得します。
 * 
 * @function getDb
 * @returns {Db} - 現在のデータベースインスタンスを返します。
 * 
 * @description
 * この関数は、既に設定されているデータベースインスタンスへの参照を返します。
 * connect関数を使用してデータベースに先に接続していることが前提です。
 */
exports.getDb = () => db;

/**
 * MongoDBの各コレクションの初期設定を非同期で行います。
 * 
 * @function init
 * @async
 * 
 * @description
 * この関数は、MongoDBの複数のコレクション（users, refresh_tokens, contents, logs_group）にインデックスを作成します。
 * - usersコレクションには、email, token, およびpassword_tokenフィールドそれぞれに基づく独立したユニークなインデックスが作成されます。
 * - refresh_tokensコレクションには、emailフィールドに基づくユニークなインデックスが作成されます。
 * - contentsコレクションには、emailフィールドとrequest.idフィールドの組み合わせに基づくインデックスが作成されます。
 * - logs_groupコレクションには、idフィールドに基づくユニークなインデックスが作成されます。
 * 
 * インデックスの作成が完了した後、"MongoDB initialized"というメッセージがログに記録されます。
 */
const init = async () => {
await db.collection('users').createIndex({ username: 1 }, { unique: true });
await db.collection('users').createIndex({ token: 1 }, { unique: true });
await db
  .collection('users')
  .createIndex({ password_token: 1 }, { unique: true, sparse: true });


  await db
    .collection('refresh_tokens')
    .createIndex({ username: 1 }, { unique: true });
  await db.collection('contents').createIndex({ username: 1, 'request.id': 1 });
  await db.collection('logs_group').createIndex({ id: 1 }, { unique: true });
  logger.info('MongoDB initialized');
};
exports.init = init;
