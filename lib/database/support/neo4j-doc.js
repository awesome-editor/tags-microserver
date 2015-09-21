function bindNeo4jDoc(opts) {

  var h = opts.h,
      uuid = opts.uuid,
      dbClient = opts.dbClient,
      neo4jFormatter = opts.neo4jFormatter;

  function createDoc(doc) {

    doc.uuid = uuid.v4();

    var query = [
      {
        statement:
          'MERGE (doc:Doc{uuid:{doc}.uuid}) ' +
          'SET doc.title = {doc}.title ' +
          'SET doc.content = {doc}.content ' +
          'RETURN doc',
        parameters: {
          doc: doc
        }
      }
    ];

    return dbClient(h([query]))
      .map(neo4jFormatter.formatSingleResultSingleData)
      .map(function(doc) {
        return doc === null ? '' : doc;
      });
  }

  function getDoc(uuid) {

    var query = [
      {
        statement:
          'MATCH (doc:Doc{uuid:{doc}.uuid}) ' +
          'RETURN doc',
        parameters: {
          doc: {uuid: uuid}
        }
      }
    ];

    return dbClient(h([query]))
      .map(neo4jFormatter.formatSingleResultSingleData)
      .map(function(doc) {
        return doc === null ? '' : doc;
      });
  }

  function deleteDoc(uuid) {

    var query = [
      {
        statement:
          'MATCH (doc:Doc{uuid:{doc}.uuid}) ' +
          'DELETE doc',
        parameters: {
          doc: {uuid: uuid}
        }
      }
    ];

    return dbClient(h([query]));
  }

  return {
    createDoc: createDoc,
    getDoc: getDoc,
    updateDoc: createDoc,
    deleteDoc: deleteDoc
  };
}

module.exports = {
  bindNeo4jDoc: bindNeo4jDoc
};

