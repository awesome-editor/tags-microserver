var config = require('../../config'),
    uuid = require('uuid'),
    http = require('http'),
    _ = require('highland'),

    db = config.tags.db,
    dbName = config.tags.dbName,

    dbUrl = db + "/db/data/transaction";



function isArray(obj) {

    return obj !== null && Object.prototype.toString.call( obj ) === '[object Array]';
}


function Neo4j() {

    this.createPath = createPath;
    this.mvDir = mvDir;


    function createPath(data) {

        var root = data.root,
            dirs = data.newPath,
            rels = root ? [root].concat(dirs) : dirs,

            createRelationships;


        createRelationships = _(rels)
            //add ids
            .map(function(node) {

                if (!node.hasOwnProperty('id')) {

                    node.id = uuid.v4();
                }

                return node;
            })
            //make relationship pairs
            .reduce(null, function(memo, cur) {

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
            })
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
            //convert into an array of statements
            .reduce([], function(total, cur) {

                total.push(cur);

                return total;
            })
            .flatMap(_.wrapCallback(function(statements, callback) {

                return post({statements: statements}, callback);
            }))
            .apply(function(res) {

                console.log(res);
            });
    }


    function mvDir(data) {

        var nodeId = data.node.id,
            fromId = data.from.id,
            toId = data.to.id,

        query = [ 
            {
                statement: "MATCH (:Tag{node})-[r:IN]->(:Tag{from})",
                parameters: {
                    node: { id : nodeId },
                    from: { id : fromId }
                }
            },
            {
                statement: "DELETE r"
            },
            {
                statement: "MERGE (:Tag{node})-[:IN]->(:Tag{to})",
                parameters: {
                    node: { id: nodeId },
                    to: { id: toId }
                }
            }
        ];
        
        return _.wrapCallback(post({statements: query}));   
    }
}

function post(data, callback) {

    var dataString = JSON.stringify(data),

        postOptions = {

          host: config.tags.db,
          port: config.tags.dbPort,
          path: config.tags.dbTransaction,
          method: 'POST',
          headers: {
              'Accept': 'application/json; charset=UTF-8',
              'Content-Type': 'application/json',
              'Content-Length': dataString.length
          }
        };

    // Set up the request
    var req = http.request(postOptions, function(res) {
      
        var responseString = '';

        res.setEncoding('utf-8');

        res.on('data', function(data) { 

            responseString += data; }
        );

        res.on('end', function() { 

            callback(null, JSON.parse(responseString));
        });
    });

    req.on('error', function(e) {
    
        callback(e, null);
    });

    req.write(dataString);
    req.end();
}

var test = new Neo4j();
test.createPath({newPath: [{name: 'a'}, {name: 'b'}, {name: 'c'}]});

module.exports = Neo4j;

