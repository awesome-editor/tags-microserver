var c = require('../lib/common/common'),
    NC = require('../lib/database/support/neo4j-common'),
    Database = require('../lib/database/neo4j'),
    _ = require('highland');


describe("neo4j-common", function () {

    var str = function(obj) {

            return JSON.stringify(obj, null, '\t');
        },

        httpPost,
        db,

        nc;


    beforeEach(function() {

        httpPost = {
            post: function (data, callback) {

                callback(null, data);
            }
        };

        nc = new NC(c, _, httpPost);
    });


    describe("post", function() {

        it("should post the data", function() {

            var data = 'hi',
                expected = {statements: data},
                actual;

            nc.post(data).apply(function(res) {
                actual = res;
            });

            expect(actual).toEqual(expected);
        });
    });


    describe("db", function() {

        var data = 'hi',
            expected = {statements: data};


        it("should post the data", function() {

            var actual;

            nc.db(_([data])).apply(function(res) {
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

            nc.db(_([data]))
                .stopOnError(function(err) {

                    actual = err;
                })
                .apply(function (res) {});

            expect(actual).toEqual(errors);
        });
    });
});
