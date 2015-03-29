var Preprocess = require('./support/tag-preprocess');


function TagList(_, db, ssaEngine, textRank, options) {

    var parameters = {
            k: options.k,
            sim: options.sim
        },

        _preprocess = new Preprocess(_, db, ssaEngine, parameters);


    this.create = create;

    this._createTagCloud = createTagCloud;
    this._recommendParentTags = recommendParentTags;


    function create(document) {
        
        //first generate tag cloud
        createTagCloud();

        //then recommend parent tags for each new tag
        recommendParentTags(targets);
    }

    function createTagCloud() {

    }

    function recommendParentTags(targets) {

        _preprocess(targets);
    }



}


module.exports = TagList;