function Neo4j(c, _, uuid, httpPost) {

    this.createIndexes = createIndexes;
    this.fetchAllTags = fetchAllTags;
    this.createPath = createPath;
    this.mvDir = mvDir;


    var post = _.wrapCallback(function(statements, callback) {

            return httpPost.post({statements: statements}, callback);
        }),

        dberrors = function(res) {

            if (res.errors.length > 0) {

                //TODO remove my console.log
                console.log(JSON.stringify(res.errors));
                throw res.errors;
            }
            
            return res;
        };


    function createIndexes() {

        var query = [
                {
                    statement:
                        "CREATE INDEX ON :Tag(name)" +
                        "CREATE INDEX ON :Tag(uuid)"
                }
            ];

        return _([query])
            .flatMap(post)
            .map(dberrors);
    }


    /**
     * You probably don't want to do this in production
     */
    function fetchAllTags() {

        var query = [
                {
                    statement:
                        "MATCH (n:Tag) " +
                        //"WHERE n.uuid <> \"0\" " +
                        "RETURN n"
                }
            ];

        return _([query])
            .flatMap(post)
            .map(dberrors);
    }


    /**
      * Creates a "path" where path is a sequence of tags.
      *
      * Ex: {newPath: [{name: 'foo'}, {name: 'bar'}]}
      * corresponds to the path 'foo/bar'
      * 
      * Every tag in newPath will be recreated.
      * 
      * Pass a root if you want to create a path from an existing tag.
      *
      * Ex: {root: {name: 'fu', uuid: //uuid}, newPath: [{name: 'bar'}]
      * corresponds to the path 'fu/bar'
      *
      * The root node must have a uuid.
      *
      * TODO add all of these validations
      */
    function createPath(data) {

        //TODO move this to validator
        if (!c.isArray(data.newPath) || data.newPath.length === 0) {

            throw "Invalid newPath";
        }

        var root = data.root || {uuid: 0, name: '_'},
            dirs = data.newPath,
            rels = root ? [root].concat(dirs) : dirs;

        return _(rels)
            .map(addId)
            .reduce(null, makeRelationshipPairs)
            .sequence()
            .map(function(pair) {

                return {
                    statement: 
                        "MERGE " +
                         "(c:Tag{uuid:{child}.uuid, name:{child}.name})" +
                         "-[r:IN]->" +
                        "(p:Tag{uuid:{parent}.uuid, name:{parent}.name}) "+
                        "RETURN c,p",
                    parameters: {
                        child: pair.child,
                        parent: pair.parent
                    }
                };
            })
            .collect()
            .flatMap(post)
            .map(dberrors);
            //.flatMap(format);
    }


    function mvDir(data) {

        var node = data.node,
            from = data.from,
            to = data.to,

        query = [ 
            {
                statement: "MATCH " +
                    "(:Tag{uuid:{node}.uuid})" +
                    "-[r:IN]->" +
                    "(:Tag{uuid:{from}.uuid})" +

                    "DELETE r",
                parameters: {
                    node: node,
                    from: from
                }
            },
            {
                statement: "MATCH" +
                    "(c:Tag{uuid:{node}.uuid})" +
                    "-[r:IN]->" +
                    "(p:Tag{uuid:{to}.uuid})" +

                    "MERGE (c)-[:IN]->(p)"+

                    "RETURN c, p",
                parameters: {
                    node: node,
                    to: to 
                }
            }
        ];
        
        return _([query])
            .flatMap(post)
            .map(dberrors);
    }


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

        query = [ 
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

    function addId(node) {

        if (!node.hasOwnProperty('uuid')) {

            node.uuid = uuid.v4();
        }

        return node;
    }

    function makeRelationshipPairs(memo, cur) {

        //the child of the prev pair becomes the parent
        if (c.isArray(memo)) {

            var parent = memo[memo.length-1].child;

            memo.push({parent: parent, child: cur});

            return memo;
        }
        //called only on the first pair
        else if (memo !== null) { 

            return [{parent: memo, child: cur}];
        }

        return cur;
    }
}




module.exports = Neo4j;

