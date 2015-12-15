function bindNeo4jDoc(opts) {

  const h = opts.h;
  const uuid = opts.uuid;
  const dbClient = opts.dbClient;
  const neo4jFormatter = opts.neo4jFormatter;


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
    createDoc,
    getDoc,
    updateDoc: createDoc,
    deleteDoc
  };
}

module.exports = {
  bindNeo4jDoc
};

