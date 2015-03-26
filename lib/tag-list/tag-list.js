var _ = require('highland');


function TagList(options) {

    var db = options.db,

        parameters = {
            k: options.parameters.k,
            sim: options.parameters.sim
        },

        ssaEngine = options.ssaEngine,
        textrank = options.ssa;


    this.create = create;

    this._createTagCloud = createTagCloud;
    this._recommendParentTags = recommendParentTags;
    this._Preprocess = Preprocess;


    function create(document) {
        
        //first generate tag cloud
        createTagCloud();

        //then recommend parent tags for each new tag
        recommendParentTags(targets);
    }

    function createTagCloud() {

    }

    function recommendParentTags(targets) {

        Preprocess(targets);
    }


    function Preprocess(targets) {

        var that = this;

        this._neighborOpts = function(target, alltags) {

            return {
                k: parameters.k,
                sim: parameters.sim,
                target: target,
                categories: alltags
            };
        };

        this._ssaOpts = function(allnearestneighbors, alltags) {

            return {}
        };

        this._fetchAllTags = _.wrapCallback(db.fetchAllTags);

        this._fetchCombinedNearestNeighbors = function(targets, alltags) {

            var run_algorithm = _.wrapCallback(function(target, callback) {

                return ssaEngine.findKNearestNeighbors(that._neighborOpts(target, alltags), callback)
            });

            return _(targets)
                .map(run_algorithm)
                .parallel(4)
                .sequence()
                .collect()
                .map(uniq);
        };

        this._fetchSSA = _.wrapCallback(function(allnearestneighbors, alltags, callback) {

            db.fetchSSA(
                that._ssaOpts(allnearestneighbors, alltags),
                callback
            )
        });

        this.preprocess = function() {

            var alltags;

            return that
                ._fetchAllTags()
                .map(function(result) {

                    return alltags = result;
                })
                .flatMap(_.curry(that._fetchCombinedNearestNeighbors(targets)))

                //.flatMap(_.curry(that._fetchSSA(alltags)));
        };

        function uniq(a) {

            var seen = {};
            var out = [];
            var len = a.length;
            var j = 0;
            for(var i = 0; i < len; i++) {
                var item = a[i];
                if(seen[item] !== 1) {
                    seen[item] = 1;
                    out[j++] = item;
                }
            }
            return out;
        }
    }
}


module.exports = TagList;