var c = require('../lib/common/common'),
    Database = require('../lib/database/neo4j'),
    _ = require('highland');


describe("neo4j", function () {

    var str = function(obj) {

            return JSON.stringify(obj, null, '\t');
        },

        httpPost,
        db,
        uuid;


    beforeEach(function() {

        httpPost = {
            post: function (data, callback) {

                callback(null, data);
            }
        };
    });


    describe("create path query", function() {

        var args = function(newPath, root) {
                return {
                    root: root,
                    newPath: newPath
                };
            },

            globalRoot = {uuid: 0, name: '__root__'},
            anySingleFilePath = [{name: 'a'}],
            anyFilePath = [
                {name: 'a'},
                {name: 'b'}
            ],
            anyFilePathWithRoot = args(
                [{name:'child'}],
                {uuid: 1, name: 'top'}
            ),


            expectedQuery = function(parent, child) {

                return {
                    statement: "MERGE " +
                        "(c:Tag{uuid:{child}.uuid, name:{child}.name})" +
                        "-[r:IN]->" +
                        "(p:Tag{uuid:{parent}.uuid, name:{parent}.name}) "+
                        "RETURN c,p",
                    parameters: {
                        child: child,
                        parent: parent
                    }
                };
            };


        beforeEach(function() {

            uuid = (function() {
                var id=1;
                return {
                    v4: function () {
                        return id++;
                    }
                };
            })();

            db = new Database(c, _, uuid, httpPost);
        });


        it("should create correct query for single tag", function() {

            var expected = [expectedQuery(globalRoot, anySingleFilePath[0])];

            db._createPathQuery(args(anySingleFilePath))
                .apply(function(res) {

                    expect(res).toEqual(expected);
                });
        });


        it("should create correct query for two or more tags", function() {

            var expected = [
                expectedQuery(globalRoot, anyFilePath[0]),
                expectedQuery(anyFilePath[0], anyFilePath[1])
            ];

            db._createPathQuery(args(anyFilePath))
                .apply(function(res) {

                    expect(str(res)).toEqual(str(expected));
                });
        });


        it("should create correct query for tag with root", function() {

            var expected = [
                expectedQuery(
                    anyFilePathWithRoot.root,
                    anyFilePathWithRoot.newPath[0]
                )
            ];

            db._createPathQuery(anyFilePathWithRoot)
                .apply(function(res) {

                    expect(str(res)).toEqual(str(expected));
                });
        });
    });


    describe("_add id", function() {

        var createdUuid = 1;


        beforeEach(function() {

            uuid = {
                v4: function () {
                    return createdUuid;
                }
            };

            db = new Database(c, _, uuid, httpPost);
        });


        it("should add uuid if tag doesn't have one", function() {

            var withoutId = {name: 'foo'};

            expect(db._addId(withoutId).uuid).toEqual(createdUuid);
        });

        it("should not add uuid if tag already has one", function() {

            var uuid = 25,
                withId = {name: 'foo', uuid: uuid};

            expect(db._addId(withId).uuid).toEqual(uuid);
        });
    });


    describe("_post", function() {

        beforeEach(function() {

            uuid = null;

            db = new Database(c, _, uuid, httpPost);
        });


        it("should post the data", function() {

            var data = 'hi',
                expected = {statements: data},
                actual;

            db._post(data).apply(function(res) {
                actual = res;
            });

            expect(actual).toEqual(expected);
        });
    });


    describe("_db", function() {

        var data = 'hi',
            expected = {statements: data};


        it("should post the data", function() {

            var actual;

            db._db(_([data])).apply(function(res) {
                actual = res;
            });

            expect(actual).toEqual(expected);
        });

        it("should report errors", function() {

            var errors = ['error'],
                actual;

            httpPost.post = function (data, callback) {

                callback(null, {errors: errors});
            };

            db = new Database(c, _, null, httpPost);

            db._db(_([data]))
                .stopOnError(function(err) {

                    actual = err;
                })
                .apply(function (res) {});

            expect(actual).toEqual(errors);
        });
    });
});
