var $ = require('underscore');


/**
 * MVP algorithm
 *
 * Given: global list of all tags,
 * string similarity
 *
 * (1) find k-nearest neighbors using string similarity
 *
 * http://blog.mgechev.com/2012/11/24/javascript-sorting-performance-quicksort-v8/ (really fast sort)
 *
 * @param k
 * @param sim - similarity measure
 * @param target - obj w/ a name property
 * @param neighbors
 * @returns {Array}
 */
function findKNearestNeighbors(k, sim, target, neighbors) {

    var name = "name",

        _target = target[name],

        sorted = $.sortBy(neighbors, function(neighbor) {

            //underscore sorts in ascending order
            //so tags w/ largest #sim score come first (these are the most similar)
            return -sim(neighbor[name], _target);
        }),

        result = [];

    for(var i=0; i<k; ++i) {

        result.push(sorted[i]);
    }

    return result;
}


/**
 * Given: global list of the directed distances of every tag to the nearest neighbors
 * (1) find SSAp
 *
 * SSA(tag1,tag2) =
 *   case path tag2 to tag1 exists =>  1 / (the directed distance of tag2 to tag1)
 *   case path tag2 to tag1 not exists => 0
 *
 * To find SSAp, you technically need to SSA of every tag to the nearest neighbors i.e.,
 * you need to find the directed distance of every tag to the nearest neighbors.
 *
 * This is a problem when the graph is stored in a database.
 * And so the MVP approach pre-loads the directed distance of every tag to the nearest neighbors.
 */
function SSAp(target, threshold, nearestneighbors, sim, SSA, allneighbors) {

    var name = "name",

        denom = 1 / sum(nearestneighbors, function(neighbor) {

            return sim(target[name], neighbor[name]);
        });

    return $.chain(allneighbors)
        .map(function(neighbor) {

            var ssa = denom * sum(nearestneighbors, function(nearestNeighbor) {

                return SSA(neighbor, nearestNeighbor)
                    * sim(target[name], nearestNeighbor[name]);
            });

            var rst = {};

            rst[name] = neighbor[name];
            rst.ssa = ssa;

            return rst;
        })
        .filter(function(ssa) {

            return ssa.ssa >= threshold;
        })
        .value();
}

function sum(_set, term) {

    return $.reduce(_set, function(memo, cur) {

        return memo + term(cur);

    }, 0);
}

module.exports._findKNearestNeighbors = findKNearestNeighbors;
module.exports.SSAp = SSAp;