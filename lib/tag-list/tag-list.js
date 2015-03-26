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
                .parallel(4);
        };

        this._fetchSSA = function(allnearestneighbors, alltags) {

            var run_algorithm = _.wrapCallback(function(callback) {

                console.log("wha")

                db.fetchSSA(
                    that._ssaOpts(allnearestneighbors, alltags),
                    callback
                )
            });

            return run_algorithm;
        };

        /*return this._fetchAllTags().flatMap(function(alltags) {

            return this
                ._fetchCombinedNearestNeighbors(targets, alltags)
                .flatMap(function(allnearestneighbors) {

                    return this._fetchSSA(allnearestneighbors, alltags);
                });
        });*/
    }
}


module.exports = TagList;