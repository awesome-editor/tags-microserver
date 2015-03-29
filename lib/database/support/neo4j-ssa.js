function Neo4jSSA(c, _, uuid, httpPost) {

    /**
     * http://neo4j.com/blog/finding-the-shortest-path-through-the-park/

     START  startNode=node:node_auto_index(name=”Start”),
     endNode=node:node_auto_index(name=”Finish”)
     MATCH  p=(startNode)-[:NAVIGATE_TO*]->(endNode)
     RETURN p AS shortestPath,
     reduce(distance=0, r in relationships(p) : distance+r.distance) AS totalDistance
     ORDER BY totalDistance ASC
     LIMIT 1;


     * http://neo4j.com/docs/stable/query-match.html

     */
    function fetchSSA() {

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
    }
}


exports.module = Neo4jSSA;