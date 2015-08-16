var neo4jFormatter = require('./neo4j-formatter').bindNeo4jFormatter();

function bindNeo4jTags(opts) {

  var h = opts.h,
      uuid = opts.uuid,
      dbClient = opts.dbClient,
      textRank = opts.textRank;

  /**
   * Will throw an error if tags don't exist
   *
   * @param data - doc uuid + array of tag uuids
   * @returns {*}
   */
  function addTagsToDoc(data) {

    var query = data.tags.map(function(taguuid) {

      return {
        statement:
          'MATCH (tag:Tag{uuid:{tag}.uuid}) ' +
          'MATCH (doc:Doc{uuid:{doc}.uuid}) ' +
          'MERGE (tag)-[r:TAG]->(doc) ' +
          'RETURN tag',
        parameters: {
          tag: {uuid: taguuid},
          doc: {uuid: data.uuid}
        }
      };
    });

    return dbClient(h([query])).map(neo4jFormatter.formatMultiResultSingleData);
  }

  function docTags(uuid) {

    var query = [
      {
        statement:
          'MATCH (tag:Tag)-[r:TAG]->(doc:Doc{uuid:{doc}.uuid}) ' +
          'RETURN tag',
        parameters: {
          doc: {uuid: uuid}
        }
      }
    ];

    return dbClient(h([query])).map(neo4jFormatter.formatSingleResultMultiData).pluck(0);
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

  function suggestedTagClouds(doc) {
    return h(textRank.generateTags(doc.title + ' ' + doc.content).tags);
  }

  return {
    addTagsToDoc: addTagsToDoc,
    docTags: docTags,
    removeTagsFromDoc: removeTagsFromDoc,

    suggestedTagClouds: suggestedTagClouds
  };
}

module.exports = {
  bindNeo4jTags: bindNeo4jTags
};

