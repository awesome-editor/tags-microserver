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


module.exports._findKNearestNeighbors = findKNearestNeighbors;