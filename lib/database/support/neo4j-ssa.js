var bindNeo4jTags = require('./neo4j-tags').bindNeo4jTags;
var bindNeo4jFormatter = require('./neo4j-formatter').bindNeo4jFormatter;
var bindNeo4jCommon = require('./neo4j-common').bindNeo4jCommon;

function bindNeo4jSSA(opts) {

  var h = opts.h,
      uuid = opts.uuid,
      dbClient = opts.dbClient,
      textRank = opts.textRank,
      _ = opts._;

  var neo4jTags = bindNeo4jTags(opts);
  var neo4jFormatter = bindNeo4jFormatter(opts);
  var neo4jCommon = bindNeo4jCommon(opts);

  /**
   * Given: list of nodes
   *
   * The shortest distance from the node to every tag in the db
   *
   * @param node
   * @returns {*}
   */
  function _fetchSSA(nodes) {

    var query = nodes.map(function (node) {
      return {
        statement: "MATCH " +
          "(n:Tag{uuid:{node}.uuid})," +
          "(tag:Tag)," +
          "p = shortestPath((n)-[*..100]->(tag))" +
          "RETURN n.uuid, tag.uuid, LENGTH(p)",
        parameters: {
          node: {uuid: node.uuid}
        }
      };
    });

    return dbClient(h([query]));
  }

  function _formatSSA(results) {

    return h([results]).map(neo4jFormatter.formatMultiResultMultiData);
  }

  /**
   * Builds a map containing, the uuid of the node
   * Each key is the uuid of a parent tag and its value is the distance to the node
   *
   * @param results
   * @returns {*}
   * @private
   */
  function _generateSSA(results) {

    var result = _.reduce(results, function(memo, cur) {

      var uuid = _.reduce(cur, function(uuidMemo, curUuid) {

        var uuid = curUuid[0],
            parent = curUuid[1],
            distance = curUuid[2];

        uuidMemo[uuid] = _.assign(
            uuidMemo[uuid] || {},
          _.zipObject([parent], [distance])
        );

        return uuidMemo;
      }, {});

      return _.assign(memo, uuid);
    }, {});

    return h([result]);
  }

  function SSA(nodes) {

    return _fetchSSA(nodes).flatMap(_formatSSA).flatMap(_generateSSA);
  }

  /**
   * To find suggested tags, need

   target: //the target tag
   sim: //similarity measure (function)
   SSA: //SSA function
   categories: //a list of existing categories

   parameters: {
     k: //the paper recommends k=3 in the real world (explained below),
     threshold: //cutoff for a good recommendation (from 0 to 1)
   }
   */
  function suggestedTagHierarchy(doc) {

    return neo4jTags
      .suggestedTagClouds(doc)
      .map(function(tags) {
        return {
          tagcloud: tags,
          SSA: SSA(tags),
          categories: neo4jCommon.fetchAllTags()
        };
      });
  }

  return {
    SSA: SSA,
    suggestedTagHierarchy: suggestedTagHierarchy
  };
}


module.exports = {
  bindNeo4jSSA: bindNeo4jSSA
};