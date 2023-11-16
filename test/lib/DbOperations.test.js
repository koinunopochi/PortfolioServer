const DbOperations = require('./../../lib/DbOperations');

// MongoDBのモック
const mockCollection = {
  insertOne: jest.fn().mockResolvedValue({ insertedId: '12345' }), // insertOneが成功時の値を返すようにモック
  find: jest.fn().mockReturnThis(), // findがメソッドチェーンをサポートするように
  toArray: jest.fn().mockResolvedValue([]), // toArrayが空の配列を返すようにモック
  findOne: jest.fn().mockResolvedValue({}), // findOneがオブジェクトを返すようにモック
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }), // updateOneが成功時の値を返すようにモック
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }), // deleteOneが成功時の値を返すようにモック
};
const mockDb = {
  collection: jest.fn().mockImplementation(() => mockCollection),
};

describe('DbOperations', () => {
  let dbOps;

  beforeEach(() => {
    dbOps = new DbOperations(mockDb, 'testCollection');
    jest.clearAllMocks();
  });

  test('insert - should insert a document', async () => {
    const testData = { name: 'test' };
    await dbOps.insert(testData);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(testData);
  });

  test('find - should find documents based on criteria', async () => {
    const testCriteria = { name: 'test' };
    const testProjection = {};
    await dbOps.find(testCriteria, testProjection);
    expect(mockCollection.find).toHaveBeenCalledWith(
      testCriteria,
      testProjection
    );
    expect(mockCollection.toArray).toHaveBeenCalled();
  });

  test('findOne - should find a single document based on criteria', async () => {
    const testCriteria = { name: 'test' };
    const testProjection = {};
    await dbOps.findOne(testCriteria, testProjection);
    expect(mockCollection.findOne).toHaveBeenCalledWith(
      testCriteria,
      testProjection
    );
  });

  test('update - should update a document', async () => {
    const testCriteria = { name: 'test' };
    const testData = { $set: { name: 'updated' } };
    await dbOps.update(testCriteria, testData);
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      testCriteria,
      testData
    );
  });

  test('delete - should delete a document', async () => {
    const testCriteria = { name: 'test' };
    await dbOps.delete(testCriteria);
    expect(mockCollection.deleteOne).toHaveBeenCalledWith(testCriteria);
  });
});
