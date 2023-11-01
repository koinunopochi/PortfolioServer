const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const DbOperations = require('../../lib/DbOperations'); // 必要に応じてパスを修正してください。

let mongoServer;
let mongoClient;
const testCollectionName = 'testCollection';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = await mongoServer.getUri();
  mongoClient = await MongoClient.connect(mongoUri);
});

afterAll(async () => {
  await mongoClient.close();
  await mongoServer.stop();
  process.env.NODE_ENV = undefined;
});

describe('DbOperationsクラス', () => {
  // テスト用のDbOperationsインスタンスを作成
  const dbOperations = new DbOperations(testCollectionName);

  it('ドキュメントを挿入する', async () => {
    // テストデータの作成
    const data = { name: 'John Doe', age: 30 };
    // ドキュメントの挿入
    const result = await dbOperations.insert(data);
    // 挿入されたドキュメントの数を検証
    expect(result.insertedCount).toBe(1);
  });

  it('ドキュメントを検索する', async () => {
    const criteria = { name: 'John Doe' };
    // ドキュメントの検索
    const results = await dbOperations.find(criteria);
    // 返されたドキュメントの数と内容を検証
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('John Doe');
  });

  it('単一のドキュメントを検索する', async () => {
    const criteria = { name: 'John Doe' };
    // ドキュメントの検索
    const result = await dbOperations.findOne(criteria);
    // 返されたドキュメントの内容を検証
    expect(result.name).toBe('John Doe');
  });

  it('ドキュメントを更新する', async () => {
    const criteria = { name: 'John Doe' };
    const updateData = { $set: { age: 31 } };
    // ドキュメントの更新
    const result = await dbOperations.update(criteria, updateData);
    // 更新されたドキュメントの数を検証
    expect(result.modifiedCount).toBe(1);

    // 更新後のドキュメントを確認
    const updatedDocument = await dbOperations.findOne(criteria);
    expect(updatedDocument.age).toBe(31);
  });

  it('ドキュメントを削除する', async () => {
    const criteria = { name: 'John Doe' };
    // ドキュメントの削除
    const result = await dbOperations.delete(criteria);
    // 削除されたドキュメントの数を検証
    expect(result.deletedCount).toBe(1);

    // 削除後、ドキュメントが存在しないことを検証
    const deletedDocument = await dbOperations.findOne(criteria);
    expect(deletedDocument).toBeNull();
  });
});
