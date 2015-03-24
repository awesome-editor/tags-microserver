var Taglist = require('../lib/tag-list/tag-list'),
    $ = require('underscore');


describe("tag list", function() {

    describe("preprocess", function() {

        it("should work", function() {

            var db = {
                fetchAllTags: function(callback) {

                    callback(null, $.range(9));
                },

                fetchSSA: function(allnearestneighbors, callback) {

                    callback(null, ['a','b']);
                }
            };

            var ssaEngine = {

                findKNearestNeighbors: function(opts, callback) {

                    callback(null, $.range(2));
                }
            };

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
        });
    });
});