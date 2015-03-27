function Neo4j(_, uuid, _post) {

    this.createIndexes = createIndexes;
    this.fetchAllTags = fetchAllTags;
    this.createPath = createPath;
    this.mvDir = mvDir;


    var post = _.wrapCallback(function(statements, callback) {

            return _post({statements: statements}, callback);
        }),

        dberrors = function(res) {

            if (res.errors.length > 0) throw res.errors;

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
                        "MATCH (tag:Tag)" +
                        "WHERE tag.uuid <> 0" +
                        "RETURN tag"
                }
            ];

        return _([query])
            .flatMap(post)
            .map(dberrors);
    }


    /**
      * Creates a "path" where path is a sequence of tags.
      *
      * Ex: [{name: 'foo'}, {name: 'bar'}]
      * which corresponds to the path 'foo/bar'
      * 
      * If a tag has no uuid, then it's considered to be a new tag.
      * Otherwise, it is a pre-existing tag.
      *
      * Only the first tag can be pre-existing. 
      *
      * Unless the first tag is pre-existing, the first tag
      * will point to the root node.
      */
    function createPath(data) {

        //TODO move this to validator
        if (!isArray(data.newPath) || data.newPath.length === 0) {

            throw "Invalid newPath";
        }

        var root = data.root || {uuid: 0},
            dirs = data.newPath,
            rels = root ? [root].concat(dirs) : dirs;

        return _(rels)
            //add ids
            .map(function(node) {

                if (!node.hasOwnProperty('uuid')) {

                    node.uuid = uuid.v4();
                }

                return node;
            })
            //make relationship pairs
            .reduce(null, makeRelationshipPairs)
            .sequence()
            .map(function(pair) {

                return {
                    statement: "MERGE " +
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
            .map(dberrors)
            .flatMap(format);
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
}




function isArray(obj) {

    return obj !== null && Object.prototype.toString.call( obj ) === '[object Array]';
}

function makeRelationshipPairs(memo, cur) {

    //the child of the prev pair becomes the parent
    if (isArray(memo)) { 

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

/**
  * Why is this so long? and non-intuitive?
  *
  * Plus res.results (an array)
  * and from this array, plucks `data`[0].row
  */
function format(res) {

    return _([res])
        .map(function(res) {

            return res.results;
        })
        .sequence()
        .map(function(data) {

            return data.data;
        })
        .reduce([], function(tot, cur) {

            tot.push(cur[0].row);

            return tot;
        })
        .map(function(nodes) {

            return {
                nodes: nodes
            };
        });
}


module.exports = Neo4j;

