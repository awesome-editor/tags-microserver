var Taglist = require('../lib/tag-list/tag-list'),
    u = require('underscore'),
    _ = require('highland');


describe("tag list", function() {

    describe("preprocess", function() {

        var Preprocess = require('../lib/tag-list/support/tag-preprocess'),


            targets = ['a', 'b', 'c'],
            alltags = u.range(9),
            allnearestneighborsmap = {
                a: [1,2],
                b: [3,4],
                c: [4,5,6]
            },
            allnearestneighbors = [1,2,3,4,5,6],
            ssavalues = ['a','b','c'],


            db = {
                fetchAllTags: _.wrapCallback(function(callback) {

                    callback(null, alltags);
                }),

                fetchSSA: function(allnearestneighbors, callback) {

                    callback(null, ssavalues);
                }
            },

            ssaEngine = {

                findKNearestNeighbors: function (opts, callback) {

                    callback(null, allnearestneighborsmap[opts.target]);
                }
            },

            opts = {
                parameters: {}
            },

            preprocess = new Preprocess(_, db, ssaEngine, opts),

            fetchAllTags =  preprocess._fetchAllTags,
            fetchCombinedNearestNeighbors = preprocess._fetchCombinedNearestNeighbors,
            fetchSSA = preprocess._fetchSSA;



        it("fetchAllTags should return all tags", function() {

            var actual;

            fetchAllTags().apply(function(result) {

                actual = result;
            });

            expect(actual).toEqual(alltags);
        });

        it("fetchCombinedNearestNeighbors should return all nearest neighbors", function() {

            var actual;

            fetchCombinedNearestNeighbors(targets, alltags).apply(function(res) {

                actual = res;
            });

            expect(actual).toEqual(allnearestneighbors);
        });

        it("fetchSSA should return ssa values", function() {

            var actual;

            fetchSSA(allnearestneighbors, alltags).apply(function(res) {

                actual = res;
            });

            expect(actual).toEqual(ssavalues);
        });


       it("should work", function() {

           var actual;

           preprocess.preprocess(targets).apply(function(result) {

               actual = result;
           });

           expect(actual).toEqual(ssavalues);
        });
    });
});