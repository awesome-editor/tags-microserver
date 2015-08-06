function Neo4jSSA(_) {

  this.fetchSSAQuery = fetchSSAQuery;


  /**
   * Given: list of nodes
   *
   * The shortest distance from the node to every tag in the db
   *
   * @param node
   * @returns {*}
   */
  function fetchSSAQuery(nodes) {

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

    return _([query]);
  }

  /**
   *
   */
}


module.exports = Neo4jSSA;