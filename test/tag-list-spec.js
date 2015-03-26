var Taglist = require('../lib/tag-list/tag-list'),
    $ = require('underscore');


describe("tag list", function() {

    describe("preprocess", function() {

        var alltags = $.range(9),
            allnearestneighbors = $.range(4),
            ssavalues = ['a','b','c'],

            db = {
                fetchAllTags: function(callback) {

                    callback(null, alltags);
                },

                fetchSSA: function(allnearestneighbors, callback) {

                    console.log('hi ho')
                    callback(null, ssavalues);
                }
            },

            ssaEngine = {

                findKNearestNeighbors: function (opts, callback) {

                    callback(null, allnearestneighbors);
                }
            },

            opts = {
                parameters: {},
                ssaEngine: ssaEngine,
                db: db
            },

            Preprocess = new Taglist(opts)._Preprocess,

            fetchAllTags = new Preprocess()._fetchAllTags,
            fetchCombinedNearestNeighbors = new Preprocess()._fetchCombinedNearestNeighbors,
            fetchSSA = new Preprocess()._fetchSSA;


        it("fetchAllTags should return all tags", function() {

            var actual;

            fetchAllTags().apply(function(result) {

                actual = result;
            });

            expect(actual).toEqual(alltags);
        });

        it("fetchCombinedNearestNeighbors should return all nearest neighbors", function() {

            var targets = ['a', 'b', 'c'],
                actual;

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


       /* it("should work", function() {



            var targets = ['x', 'y'];

            var opts = {
                parameters: {},
                ssaEngine: ssaEngine,
                db: db
            };

            var taglist = new Taglist(opts) ;

            //spyOn(db, 'fetchAllTags');

            taglist
                ._preprocess(targets)
                 .apply(function(res) {

                     console.log('Hell\'s yea!');
                     expect(res).toEqual(['a', 'b']);
                 });

            //expect(db.fetchAllTags).toHaveBeenCalled();
        });*/
    });
});