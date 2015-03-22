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

            post = {
                post: function(data, callback) {

                    callback(null, data);
                }
            };

            format = {
                format: function(data) {

                    return _([data])
                        .map(function(res) {

                            return res;
                        });
                }
            };

            var Neo4j = new Database(post, format);

            db = new Neo4j();

            spyOn(post, 'post');
            spyOn(format, 'format');
        });


        it("should call post", function() {

            db.createPath(args([anyFilePath[0]]))
                .apply(function(res) {

                    expect(post.post).toHaveBeenCalled();
                });
        });


        it("should call format", function() {

            db.createPath(args([anyFilePath[0]]))
                .apply(function(res) {

                    expect(format.format).toHaveBeenCalled();
                });
        });


        it("should create correct query for single node", function() {

            var expected = { statements: [
                    expectedQuery(root, anyFilePath[0]),
                ]
            };


            db.createPath(args([anyFilePath[0]]))
                .apply(function(res) {

                    expect(res).toEqual(expected);
                });
        });


        it("should create correct query for filepath", function() {

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


        it("should create correct query for filepath with root", function() {

            var expected = { statements: [
                    expectedQuery(root, anyFilePath[0]),
                    expectedQuery(anyFilePath[0], anyFilePath[1])
                ]
            };


            db.createPath(args(anyFilePath, root))
                .apply(function(res) {

                    expect(res).toEqual(expected);
                });
        });
    });
});
