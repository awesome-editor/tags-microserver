var bindNeo4jCommon = require('./support/neo4j-common').bindNeo4jCommon,
    bindNeo4jDoc = require('./support/neo4j-doc').bindNeo4jDoc,
    bindNeo4jFormatter = require('./support/neo4j-formatter').bindNeo4jFormatter,
    bindNeo4jTags = require('./support/neo4j-tags').bindNeo4jTags,
    bindnewo4jSSA = require('./support/neo4j-ssa').bindNeo4jSSA;


function bindNeo4j(opts) {

    var c = opts.c,
        _ = opts._,
        h = opts.h,
        uuid = opts.uuid,
        httpPost = opts.post;

    var neo4jCommon = bindNeo4jCommon(opts);

    var dbClient = neo4jCommon.db,

        formatCreate = function(results) {

            return h([results])
                .pluck('results')
                .sequence() //list results
                .pluck('data')
                .pluck(0)
                .pluck('row')
                .collect();
        };


    function createIndexes() { return dbClient(_createIndexesQuery()) }

    function createPath(data) {
        return dbClient(_createPathQuery(_validateCreatePath(data)))
            .flatMap(formatCreate);
    }

    function mvDir(data) { return dbClient(_mvDirQuery(data)) }


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

  _.assign(opts, {dbClient:dbClient});

  var neo4jDoc = bindNeo4jDoc(opts);
  //var neo4jFormatter = bindNeo4jFormatter();
  var neo4jSSA = bindnewo4jSSA(opts);
  var neo4jTags = bindNeo4jTags(opts);

  return _.assign({
    createIndexes: createIndexes,
    createPath: createPath,
    mvDir: mvDir,

    _createPathQuery: _createPathQuery,
    _addId: _addId,
    _db: neo4jCommon.db
  },
    neo4jCommon,
    neo4jDoc,
    neo4jSSA,
    neo4jTags
  );
}


module.exports = {bindNeo4j: bindNeo4j};

