var config = require('../../config'),
    Post = require('./post'),

    uuid = require('uuid'),
    _ = require('highland'),

    postOptions = {
        host: config.tags.db,
        port: config.tags.dbPort,
        path: config.tags.dbTransaction
    };



function Neo4j(post, format) {

    function Module() {


        this.createPath = createPath;
        this.mvDir = mvDir;


        var post = _.wrapCallback(function(statements, callback) {

                return post({statements: statements}, callback);
            }),

            dberrors = function(res) {

                if (res.errors.length > 0) throw res.errors;

                return res;
            };


        function createPath(data) {

            if (!isArray(data.newPath) || data.newPath.length === 0) {

                throw "Invalid newPath";
            }

            var root = data.root || {id: 0},
                dirs = data.newPath,
                rels = root ? [root].concat(dirs) : dirs;

            return _(rels)
                //add ids
                .map(function(node) {

                    if (!node.hasOwnProperty('id')) {

                        node.id = uuid.v4();
                    }

                    return node;
                })
                //make relationship pairs
                .reduce(null, makeRelationshipPairs)
                .sequence()
                .map(function(pair) {

                    return {
                        statement: "MERGE " +
                            "(c:Tag{id:{child}.id, name:{child}.name})" +
                            "-[r:IN]->" +
                            "(p:Tag{id:{parent}.id, name:{parent}.name}) "+
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
                        "(:Tag{id:{node}.id})" +
                        "-[r:IN]->" +
                        "(:Tag{id:{from}.id})" +

                        "DELETE r",
                    parameters: {
                        node: node,
                        from: from
                    }
                },
                {
                    statement: "MATCH" +
                        "(c:Tag{id:{node}.id})" +
                        "-[r:IN]->" +
                        "(p:Tag{id:{to}.id})" +

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
                .map(function(res) {

                  if (res.errors.length > 0) throw res.errors;

                    return res;
                });
            }
    }

    return Module;
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



module.exports.Database = new Neo4j(new Post(postOptions).post, format);
module.exports._Database = Neo4j;

