const { getDb } = require('./mongo');

/**
 * MongoDBの操作をまとめたクラス。
 */
class DbOperations {
  /**
   * @param {DB} db dbインスタンス
   * @param {string} collectionName - 操作対象のコレクション名
   */
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
  }

  /**
   * 対象のコレクションを取得します。
   * @private
   * @returns {Promise<Collection>} MongoDBコレクションへのPromise。
   */
  async _getCollection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * ドキュメントを挿入します。
   * @param {Object} data - 挿入するドキュメント。
   * @returns {Promise<InsertOneWriteOpResult>} 挿入結果へのPromise。
   */
  async insert(data) {
    const collection = await this._getCollection();
    return await collection.insertOne(data).catch((err) => {
      throw err;
    });
  }

  /**
   * ドキュメントを検索します。
   * @param {Object} criteria - 検索クエリ。
   * @param {Object} projection - プロジェクション（取得するフィールドの指定）。
   * @returns {Promise<Array>} 検索結果の配列へのPromise。
   */
  async find(criteria, projection) {
    const collection = await this._getCollection();
    return await collection
      .find(criteria, projection)
      .toArray()
      .catch((err) => {
        throw err;
      });
  }

  /**
   * 単一のドキュメントを検索します。
   * @param {Object} criteria - 検索クエリ。
   * @param {Object} projection - プロジェクション。
   * @returns {Promise<Object|null>} 検索結果へのPromise。ドキュメントが存在しない場合はnull。
   */
  async findOne(criteria, projection) {
    const collection = await this._getCollection();
    return await collection.findOne(criteria, projection).catch((err) => {
      throw err;
    });
  }

  /**
   * ドキュメントを更新します。
   * @param {Object} criteria - 更新対象のクエリ。
   * @param {Object} data - 更新内容。
   * @returns {Promise<UpdateWriteOpResult>} 更新結果へのPromise。
   */
  async update(criteria, data) {
    const collection = await this._getCollection();
    return await collection.updateOne(criteria, data).catch((err) => {
      throw err;
    });
  }

  /**
   * ドキュメントを削除します。
   * @param {Object} criteria - 削除対象のクエリ。
   * @returns {Promise<DeleteWriteOpResult>} 削除結果へのPromise。
   */
  async delete(criteria) {
    const collection = await this._getCollection();
    return await collection.deleteOne(criteria).catch((err) => {
      throw err;
    });
  }
}

module.exports = DbOperations;

/**
 * 指定されたコレクションを取得します。
 * @param {string} collectionName - 取得するコレクションの名前。
 * @returns {Promise<Collection>} MongoDBコレクションへのPromise。
 */
const getCollection = async (collectionName) => {
  const db = await getDb();
  return db.collection(collectionName);
};
