var SSA = require('./support/neo4j-ssa'),
    NC = require('./support/neo4j-common');


function Neo4j(c, _, uuid, httpPost) {

    var nc = new NC(c, _, httpPost),
        ssa = new SSA(_),

        db = nc.db;


    this.createIndexes = function() { return db(createIndexesQuery()) };

    this.fetchAllTags = function() { return db(fetchAllTagsQuery()) };

    this.createPath = function(data) {
        return db(createPathQuery(validateCreatePath(data)));
    };

    this.mvDir = function(data) { return db(mvDirQuery(data)) };

    this.fetchSSA = function(data) { return db(ssa.fetchSSAQuery(data)) };


    this._createPathQuery = createPathQuery;
    this._fetchAllTagsQuery = fetchAllTagsQuery;
    this._addId = _addId;
    this._db = nc.db;

    function createIndexesQuery() {

        var query = [
                {
                    statement:
                        "CREATE INDEX ON :Tag(name)" +
                        "CREATE INDEX ON :Tag(uuid)"
                }
            ];

        return _([query]);
    }


    function fetchAllTagsQuery() {

        var query = [
                {
                    statement:
                        "MATCH (n:Tag) " +
                        "WHERE n.uuid <> \"0\" " +
                        "RETURN n"
                }
            ];

        return _([query]);
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
    function validateCreatePath(data) {

        var root = data.root,
            newPath = data.newPath;

        if (!c.isArray(newPath) || newPath.length === 0) {

            throw "Invalid newPath " + newPath;
        }

        return data;
    }

    function createPathQuery(data) {

        var root = data.root || {uuid: 0, name: '__root__'},
            newPath = data.newPath,

            dirs = root ? [root].concat(newPath) : newPath;

        return _(dirs)
            .map(_addId)
            .reduce(null, _makeRelationshipPairs)
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
            .collect();
    }


    function mvDirQuery(data) {

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
        
        return _([query]);
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
}


module.exports = Neo4j;

