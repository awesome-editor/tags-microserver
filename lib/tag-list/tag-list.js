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
    this._preprocess = preprocess;


    function create(document) {
        
        //first generate tag cloud
        createTagCloud();

        //then recommend parent tags for each new tag
        recommendParentTags(targets);
    }

    function createTagCloud() {

    }

    function recommendParentTags(targets) {

        preprocess(targets);
    }

    function preprocess(targets) {

        var neighborOpts = function(target, tags) {

                return { 
                    k: parameters.k,
                    sim: parameters.sim,
                    target: target,
                    categories: tags
                };
            },

            fetchAllTags = _.wrapCallback(db.fetchAllTags);

            findKNearestNeighbors = _.wrapCallback(ssaEngine.findKNearestNeighbors),

            fetchSSA = _.wrapCallback(db.fetchSSA);


        return fetchAllTags()
            .map(function(tags) {

                return _([targets])
                        .map(function(target) {

                            var opts = neighborOpts(target, tags);

                            return findKNearestNeighbors(opts);
                        })
                        .parallel(4)
                        .sequence()
                        .uniq()
                        .collect()
                        .doto(console.log)
            })
            .sequence()
            .map(fetchSSA)
            .sequence();
    }
}


module.exports = TagList;