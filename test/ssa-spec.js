var ssa = require('../lib/ssa/ssa'),
    $ = require('underscore');


describe("ssa", function() {

    describe("find k nearest neighbors", function() {

        /**
         * Usual euclidian distance can be thought of as a "similarity" measure.
         * The farther away a number is to another number, the "closer" they are in this similarity
         * measure. So if we give #findKNearestNeighbors input:
         *
         * target = 0,
         * tag list = [0, 1, 2, 3, ..., 10]
         * sim = Math.abs
         * k = 3
         *
         * Then it will return the 3-top-most numbers
         *
         */
        it("should work", function() {

            var k = 3,
                sim = function(x,y) { return Math.abs(x,y);},
                target = {name: 0},
                neighbors = $.range(11).map(function(x){ return {name:x}}),

                actual = $.pluck(ssa._findKNearestNeighbors(k,sim,target,neighbors), 'name');

            expect(actual).toEqual([10,9,8]);

        });
    });
});