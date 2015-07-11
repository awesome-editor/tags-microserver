function Neo4jSSA(_) {

    this.fetchSSAQuery = fetchSSAQuery;


    /**
     * Given: node.uuid
     *
     * The shortest distance from the node to every tag in the db
     *
     * @param node
     * @returns {*}
     */
    function fetchSSAQuery(node) {

        var query = [
            {
                statement: "MATCH " +
                    "(n:Tag{uuid:{node}.uuid})," +
                    "(tag:Tag)," +
                    "p = shortestPath((n)-[*..100]->(tag))" +
                    "RETURN n.uuid, tag.uuid, LENGTH(p)",
                parameters: {
                    node: node
                }
            }
        ];

        return _([query]);
    }
}


module.exports = Neo4jSSA;