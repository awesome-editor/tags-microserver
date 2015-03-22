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
            .flatMap(_.wrapCallback(function(statements, callback) {

                return post({statements: statements}, callback);
            }))
            .map(function(res) {

              if (res.errors.length > 0) throw res.errors;

                return res;
            });
        }
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

            if (res.errors.length > 0) throw res.errors;

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

            console.log(nodes);
 
            return {
                nodes: nodes
            };
        });
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

            console.log(JSON.parse(responseString))
            callback(null, JSON.parse(responseString));
        });
    });

    req.on('error', function(e) {
    
        callback(e, null);
    });

    req.write(dataString);
    req.end();
}

// var test = new Neo4j();
// //test.createPath({newPath: [{name: 'a'}, {name: 'b'}, {name: 'c'}]});
// //test.createPath({newPath: [{name: 'd'}, {name: 'e'}]});

//  test.mvDir({
//      node: {id: '8ede4db5-9d2b-4212-a2cf-5d91cc090e5f'},
//      from: {id: 'e26737ef-e83c-488a-ab96-f36e69b06217'},
//      to: {id: '4c9f6e2a-dc53-4211-9bbe-027016bce4fd'}
//  }).apply(function(res) {
//     console.log(res);
//  });

module.exports = Neo4j;

