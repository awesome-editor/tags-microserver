function Neo4jSSA(_) {

    this.fetchSSAQuery = fetchSSAQuery;


    function fetchSSAQuery(node) {

        var query = [
            {
                statement: "MATCH " +
                    "(n:Tag{uuid:{node}.uuid})," +
                    "(tag:Tag)" +
                    "p = shortestPath((n)-[*..100]->(tag)" +
                    "RETURN LENGTH(p)",
                parameters: {
                    node: node
                }
            }
        ];

        return _(query);
    }
}


module.exports = Neo4jSSA;