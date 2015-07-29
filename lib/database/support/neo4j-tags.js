var formatter = require('./neo4j-formatter').bindNeo4jFormatter();


function bindNeo4jTags(opts) {

  var h = opts.h,
    uuid = opts.uuid,
    dbClient = opts.dbClient;

  /**
   * Will throw an error if tags don't exist
   *
   * @param data
   * @returns {*}
   */
  function addTagsToDoc(data) {

    var query = data.tags.map(function(taguuid) {

      return {
        statement:
          'MATCH (tag:Tag{uuid:{tag}.uuid}) ' +
          'MATCH (doc:Doc{uuid:{node}.uuid}) ' +
          'MERGE (tag)-[r:TAG]->(doc) ' +
          'RETURN r',
        parameters: {
          doc: {uuid: data.uuid},
          tag: {uuid: taguuid}
        }
      };
    });

    return dbClient(h([query]));//.map(formatter.formatSingleResult);
  }

  function getDocTags(uuid) {

    var query = [
      {
        statement:
          'MATCH (tag:Tag)-->(doc:Doc{uuid:{doc}.uuid}) ' +
          'RETURN tag',
        parameters: {
          doc: {uuid: uuid}
        }
      }
    ];

    return dbClient(h([query]));//.map(formatter.formatSingleResult);
  }

  function removeTagsFromDoc(data) {

    var query = data.tags.map(function(taguuid) {
      return {
        statement:
          'MATCH (tag:Tag{uuid:{tag}.uuid})-[r:TAG]->(doc:Doc{uuid:{doc}.uuid}) ' +
          'DELETE r',
        parameters: {
          doc: {uuid: data.uuid},
          tag: {uuid: taguuid}
        }
      };
    });

    return dbClient(h([query]));
  }

  return {
    addTagsToDoc: addTagsToDoc,
    getDocTags: getDocTags,
    removeTagsFromDoc: removeTagsFromDoc
  };
}

module.exports = {
  bindNeo4jTags: bindNeo4jTags
};

