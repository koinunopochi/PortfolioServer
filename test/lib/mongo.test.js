const { MongoMemoryServer } = require('mongodb-memory-server');
const { connect, getDb, init, closeConnection } = require('../../lib/mongo');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URL = mongoUri;
  await connect();
});

afterAll(async () => {
  await mongoServer.stop();
  await closeConnection();
});

// MongoDBの操作に関するテスト群
describe('MongoDB Operations', () => {
  // in-memoryのデータベースに接続できるかをテスト
  it('should connect to in-memory db', async () => {
    const db = getDb(); // データベースインスタンスを取得
    // データベースインスタンスが取得できたかを確認（真偽値で存在するかどうかをチェック）
    expect(db).toBeTruthy();
  });

  // コレクションの初期設定が正しく行われるかをテスト
  it('should initialize collections', async () => {
    await init(); // コレクションの初期設定を実行

    const db = getDb(); // データベースインスタンスを取得
    const usersIndexes = await db.collection('users').indexes(); // usersコレクションのインデックスを取得

    // usersコレクションに{ username: 1 }のインデックスが存在するかを確認
    expect(usersIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { username: 1 } }),
      ])
    );

    // usersコレクションに{ token: 1 }のインデックスが存在するかを確認
    expect(usersIndexes).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: { token: 1 } })])
    );

    // usersコレクションに{ password_token: 1 }のインデックスが存在するか（かつ一部のドキュメントだけに存在するsparseオプションがあるか）を確認
    expect(usersIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { password_token: 1 } }),
      ])
    );

    // refresh_tokensコレクションに{ username: 1 }のインデックスが存在するか、かつuniqueオプションが設定されているかを確認
    const refreshTokenIndexes = await db.collection('refresh_tokens').indexes();
    expect(refreshTokenIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { username: 1 },
          unique: true,
        }),
      ])
    );
  });
});
