/* global chance, PouchDB */
const DataGenerator = {};

DataGenerator.createApiObject = function() {
  var title = chance.sentence({words: 2});
  var version = 'v' + chance.integer({min: 1, max: 5});
  var baseUri = chance.url();
  var id = encodeURIComponent(title.toLowerCase());
  id += '/' + encodeURIComponent(version.toLowerCase());
  id += '/' + encodeURIComponent(baseUri.toLowerCase());

  var project = {
    _id: id,
    title: title,
    version: version,
    baseUri: baseUri,
    order: 0,
    description: chance.bool() ? chance.paragraph() : undefined,
  };
  return project;
};

DataGenerator.generateApis = function(size) {
  size = size || 5;
  var result = [];
  for (var i = 0; i < size; i++) {
    result.push(DataGenerator.createApiObject());
  }
  return result;
};
DataGenerator.generateApiData = function(apisIndex) {
  var result = [];
  apisIndex.forEach(item => {
    result.push({
      _id: item._id,
      raml: {
        title: item.title,
        version: item.version,
        baseUri: item.baseUri,
        description: item.description
      }
    });
  });
  return result;
};
DataGenerator.generateData = function(size) {
  var projects = DataGenerator.generateApis(size);
  var data = DataGenerator.generateApiData(projects);
  var indexDb = new PouchDB('rest-api-index');
  var dataDb = new PouchDB('rest-api-data');
  return indexDb.bulkDocs(projects)
  .then(() => {
    return dataDb.bulkDocs(data);
  });
};
DataGenerator.destroyData = function() {
  var db = new PouchDB('rest-api-index');
  var dataDb = new PouchDB('rest-api-data');
  return db.destroy()
  .then(() => dataDb.destroy());
};
