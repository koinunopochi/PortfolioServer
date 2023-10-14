const { getCollection } = require('./db_utils');

class DbOperations {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async _getCollection() {
    return await getCollection(this.collectionName);
  }

  async insert(data) {
    const collection = await this._getCollection();
    const result = await collection.insertOne(data).catch((err) => {
      throw err;
    });
    return result;
  }

  async find(criteria, projection) {
    const collection = await this._getCollection();
    const result = await collection
      .find(criteria, { projection })
      .toArray()
      .catch((err) => {
        throw err;
      });
    return result;
  }

  async findOne(criteria, projection) {
    const collection = await this._getCollection();
    const result = await collection
      .findOne(criteria, { projection })
      .catch((err) => {
        throw err;
      });
    return result;
  }

  async update(criteria, data) {
    const collection = await this._getCollection();
    const result = await collection
      .updateOne(criteria, { $set: data })
      .catch((err) => {
        throw err;
      });
    return result;
  }
  
  async delete(criteria) {
    const collection = await this._getCollection();
    const result = await collection.deleteOne(criteria).catch((err) => {
      throw err;
    });
    return result;
  }

  // 必要に応じて、他のメソッドもこちらに追加できます。
}

module.exports = DbOperations;
