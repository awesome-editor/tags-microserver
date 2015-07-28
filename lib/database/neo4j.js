var SSA = require('./support/neo4j-ssa'),
    NC = require('./support/neo4j-common'),
    neo4jDoc = require('./support/neo4j-doc');


/**
 *
 * @param c common
 * @param h highland
 * @param uuid
 * @param httpPost http post helper
 * @constructor
 */
function bindNeo4j(c, _, h, uuid, httpPost) {

    var nc = new NC(c, h, httpPost),
        ssa = new SSA(h),

        db = nc.db,

        format = function(results) {

            return h([results])
                .pluck('results')
                .pluck(0)
                .pluck('data')
                .sequence()
                .pluck('row')
                .pluck(0)
                .collect();
        },

        formatCreate = function(results) {

            return h([results])
                .pluck('results')
                .sequence() //list results
                .pluck('data')
                .pluck(0)
                .pluck('row')
                .collect();
        },

        formatSSA = function(results) {

            return h([results])
                .pluck('results')
                .pluck(0)
                .pluck('data')
                .sequence()
                .pluck('row')
                .map(function(row) {

                    return {
                        uuid: row[0],
                        parent: row[1],
                        distance: row[2]
                    };
                })
                .reduce({ssa:{}}, function(tot, cur) {

                    tot.uuid = cur.uuid;
                    tot.ssa[cur.parent] = cur.distance;

                    return tot;
                });
        };


    function createIndexes() { return db(_createIndexesQuery()) }

    function fetchAllTags() {
        return db(_fetchAllTagsQuery())
            .flatMap(format);
    }

    function createPath(data) {
        return db(_createPathQuery(_validateCreatePath(data)))
            .flatMap(formatCreate);
    }

    function mvDir(data) { return db(_mvDirQuery(data)) }

    function fetchSSA(data) {
        return db(ssa.fetchSSAQuery(data))
            .flatMap(formatSSA)};


    function _createIndexesQuery() {

        var query = [
                {
                    statement:
                        "CREATE INDEX ON :Tag(name)" +
                        "CREATE INDEX ON :Tag(uuid)"
                }
            ];

        return h([query]);
    }


    function _fetchAllTagsQuery() {

        var query = [
                {
                    statement:
                        "MATCH (n:Tag) " +
                        "WHERE n.uuid <> \"0\" " +
                        "RETURN n"
                }
            ];

        return h([query]);
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
      */
    function _validateCreatePath(data) {

        var root = data.root,
            newPath = data.newPath;

        if (!c.isArray(newPath) || newPath.length === 0) {

            throw "Invalid newPath " + newPath;
        }

        return data;
    }

    function _createPathQuery(data) {

        var root = data.root || {uuid: 0, name: '__root__'},
            newPath = data.newPath,

            dirs = root ? [root].concat(newPath) : newPath;

        return h(dirs)
            .map(_addId)
            .reduce(null, _makeRelationshipPairs)
            .sequence()
            .map(function(pair) {

                return {
                    statement:
                        "MERGE (c:Tag{uuid:{child}.uuid, name:{child}.name}) " +
                        "MERGE (p:Tag{uuid:{parent}.uuid, name:{parent}.name}) " +
                        "MERGE (c)-[r:IN]->(p) " +
                        "RETURN c,p",
                    parameters: {
                        child: pair.child,
                        parent: pair.parent
                    }
                };
            })
            .collect();
    }


    function _mvDirQuery(data) {

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
        
        return h([query]);
    }


    function _addId(node) {

        if (!node.hasOwnProperty('uuid')) {

            node.uuid = uuid.v4();
        }

        return node;
    }

    function _makeRelationshipPairs(memo, cur) {

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

  return _.assign({
    createIndexes: createIndexes,
    fetchAllTags: fetchAllTags,
    createPath: createPath,
    mvDir: mvDir,
    fetchSSA: fetchSSA,

    _createPathQuery: _createPathQuery,
    _fetchAllTagsQuery: _fetchAllTagsQuery,
    _addId: _addId,
    _db: nc.db
  },
    neo4jDoc.bindNeo4jDoc({h:h, uuid:uuid})
  );
}


module.exports = {bindNeo4j: bindNeo4j};

