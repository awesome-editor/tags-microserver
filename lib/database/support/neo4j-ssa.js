function Neo4jSSA(c, _, uuid, httpPost) {

    this.fetchSSAQuery = fetchSSAQuery;


    /**
     * Makes the actual db call
     * @param queryStream
     * @returns {*}
     * @private
     */
    function _db(queryStream) {

        return queryStream
            .flatMap(_post)
            .map(_processDBErrors);
    }

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


exports.module = Neo4jSSA;