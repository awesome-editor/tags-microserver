function bindNeo4jTags(opts) {

  var h = opts.h,
      uuid = opts.uuid,
      dbClient = opts.dbClient,
      textRank = opts.textRank,
      neo4jFormatter = opts.neo4jFormatter;

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

    return dbClient(h([query]))
      .map(neo4jFormatter.formatMultiResultSingleData)
      .map(function(row) {
        return row === null ? '' : row;
      });
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

  /**
   * Gets a documents tag cloud using text-rank.
   * Does not look up tags in db.
   *
   * @param doc
   * @returns {*}
   */
  function rawSuggestedTagCloud(doc) {
    return h(textRank.generateTags(doc.title + ' ' + doc.content).tags);
  }

  /**
   * Like #rawSuggestedTagCloud.
   * When a tag exists in db, returns its uuid.
   *
   * @param doc
   * @returns {Array}
   */
  function naiveSuggestedTagCloud(doc) {
    return rawSuggestedTagCloud(doc)
       .reduce({rawTags:[], query:[]}, function(memo, tag) {

        memo.rawTags.push(tag);
        memo.query.push({

          //TODO why doesn't Tag work
          //TODO add mo' constraints
          statement:
            'MATCH (tag) ' +
            'WHERE tag.name={tag}.name ' +
            'RETURN tag',
          parameters: {
            tag: {name: tag}
          }

        });

        return memo;
      })
      .flatMap(function(memo) {

        //similar to Bacon.combineTemplate?
        return dbClient(h([memo.query])).map(neo4jFormatter.formatMultiResultSingleData).map(function(result) {
          return {
            rawTags: memo.rawTags,
            result: result
          };
        });
      })
      .map(function(template) {

        return template.rawTags.map(function(tag, i) {

          return template.result[i] ? template.result[i] : {name: tag};
        });
      })
  }

  return {
    addTagsToDoc: addTagsToDoc,
    docTags: docTags,
    removeTagsFromDoc: removeTagsFromDoc,

    rawSuggestedTagCloud: rawSuggestedTagCloud,
    naiveSuggestedTagCloud: naiveSuggestedTagCloud
  };
}

module.exports = {
  bindNeo4jTags: bindNeo4jTags
};

