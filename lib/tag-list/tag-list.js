function TagList(_, db, ssaEngine, textRank, options) {

    var parameters = {
            k: options.k,
            sim: options.sim
        };


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


    function Preprocess() {

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

        /**
         * Fetches all tags from database layer
         */
        this._fetchAllTags = _.wrapCallback(db.fetchAllTags);

        /**
         * Fetches a given targets nearest neighbors from the list of all tags.
         * Combines the results for all targest into a single list.
         *
         * @param targets
         * @param alltags
         * @returns {*}
         * @private
         */
        this._fetchCombinedNearestNeighbors = function(targets, alltags) {

            var run_algorithm = _.wrapCallback(function(target, callback) {

                ssaEngine.findKNearestNeighbors(that._neighborOpts(target, alltags), callback);
            });

            return _(targets)
                .map(run_algorithm)
                .parallel(10)
                .sequence()
                .collect()
                .map(uniq);
        };

        /**
         *
         */
        this._fetchSSA = _.wrapCallback(function(allnearestneighbors, alltags, callback) {

            db.fetchSSA(
                that._ssaOpts(allnearestneighbors, alltags),
                callback
            )
        });


        this.preprocess = function(targets) {

            return that._fetchAllTags()
                .flatMap(function(alltags) {

                    return that._fetchCombinedNearestNeighbors(targets, alltags)
                        .flatMap(function (allneighbors) {

                            return that._fetchSSA(allneighbors, alltags);
                        });
                });
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