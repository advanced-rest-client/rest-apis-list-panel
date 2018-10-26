/* global chance, PouchDB */
const DataGenerator = {};

DataGenerator.createApiObject = function() {
  const title = chance.sentence({words: 2});
  const version = 'v' + chance.integer({min: 1, max: 5});
  const baseUri = chance.url();
  const _id = baseUri.toLowerCase();

  const project = {
    _id,
    title,
    order: 0,
    versions: [version],
    latest: version
  };
  return project;
};

DataGenerator.generateApis = function(size) {
  size = size || 5;
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(DataGenerator.createApiObject());
  }
  return result;
};
DataGenerator.generateApiData = function(apisIndex) {
  const result = [];
  apisIndex.forEach((item) => {
    result.push({
      _id: item._id + '|' + item.version,
      version: item.version,
      indexId: item._id
    });
  });
  return result;
};
DataGenerator.generateData = function(size) {
  const projects = DataGenerator.generateApis(size);
  const data = DataGenerator.generateApiData(projects);
  const indexDb = new PouchDB('api-index');
  const dataDb = new PouchDB('api-data');
  return indexDb.bulkDocs(projects)
  .then(() => {
    return dataDb.bulkDocs(data);
  });
};
DataGenerator.destroyData = function() {
  const db = new PouchDB('api-index');
  const dataDb = new PouchDB('api-data');
  return db.destroy()
  .then(() => dataDb.destroy());
};
