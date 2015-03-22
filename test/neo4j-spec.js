var Database = require('../lib/database/neo4j')._Database,
    _ = require('highland');


describe("neo4j", function () {

    describe("createPath", function() {

        var post,
            format,
            db,


            root = {id: 0},
            anyFilePath = [
                {id: 1, name: 'a'},
                {id: 2, name: 'b'}
            ],


            args = function(filePath, root) {

                return {
                    root: root, 
                    newPath: filePath
                };
            },

            expectedQuery = function(parent, child) {

                return {
                    statement: "MERGE " +
                        "(c:Tag{id:{child}.id, name:{child}.name})" +
                        "-[r:IN]->" +
                        "(p:Tag{id:{parent}.id, name:{parent}.name}) "+
                        "RETURN c,p",
                    parameters: {
                        child: child,
                        parent: parent
                    }
                };
            };


        beforeEach(function() {

            post = function(data, callback) {

                callback(null, data);
            };

            format = function(data) {

                return _([data])
                    .map(function(res) {

                        return res;
                    });
            };


            var Neo4j = new Database(post, format);

            db = new Neo4j();

            // spyOn(res, 'status').andCallFake(function() {

            //     return json;
            // });
        });


        it("should create correct query", function() {

            var expected = { statements: [
                    expectedQuery(root, anyFilePath[0]),
                    expectedQuery(anyFilePath[0], anyFilePath[1])
                ]
            };


            db.createPath(args(anyFilePath))
                .apply(function(res) {

                    expect(res).toEqual(expected);
                });
        });
    });
});
