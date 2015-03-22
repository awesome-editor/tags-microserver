var _ = require('highland');


function noop() {}

function isArray(obj) {

    return obj !== null && Object.prototype.toString.call( obj ) === '[object Array]';
}


function Methods(db) {

   this.create = create;


    /**
     * Takes an array of tags where each
     * tag is really a path (think file directory).
     * 
     * Each tag is of the form

     * [new_node+] OR
     * [existing_node+, new_node+]
     *
     * 
     * Ex: var tag1 = [ {name: 'ai'}, {name: 'CNN'}]
     * 
     * tag1 is the path 'ai/CNN'. Both nodes will be created
     * in the database (because none has an id). If this were
     * really a path, it's the same as `mkdir -p ai/CNN`
     *
     * Ex: var tag2 = [ 
     *   {id: //some id, name: 'appendix'},
     *   {id: //another id, name: 'linear alegbra'},
     *   {name: 'kernel'} 
     * ]
     * 
     * tag2 is the path 'appendix/linear algebra/kernel' 
     * where both 'appendix' and 'linear algebra'
     * already exist in the database (since each has an id). 
     * It's the same as adding a new directory 'kernel' to an 
     * existing directory 'appendix/linear algebra'
     *
     * The last nodes in each tag can't exist in
     * the database, otherwise it throws an error.
     *
     * 
     * BTW: This is a slow, ugly son of a gun (my first attempt at highland)
     */
    function create(req, res, next) {


        var path = req.body,


            isExistingNode = function(node) {

                return node !== null && node.hasOwnProperty('id');
            },

            /**
              * This is a hack to use #reduce to get last existingnode + rest
              */
            getLastExistingNodePlusNew = function(memo, cur) {

                //we reached the last existing node + start of rest
                if (isExistingNode(memo) && !isExistingNode(cur)) {

                    return [memo, cur];                
                }
                //no existing nodes
                else if (memo === null && !isExistingNode(cur)) {

                    return [cur];
                }
                //we're in the new nodes
                else if (isArray(memo)) {

                    memo.push(cur);
                    return memo;
                }

                return cur;
            },

            loadNode = _.wrapCallback(function(node, callback) {

                switch(isExistingNode(node)) {

                    case true: return db.getNodeById(node.id, callback);
                    case false: return db.createNode(node).save(callback);
                }
            }),

            getRelationships = function(memo, cur) {

                //the child of the prev pair becomes the parent
                if (isArray(memo)) { 

                    var parent = memo[memo.length-1].child;

                    memo.push({parent: parent, child: cur});

                    return memo;
                }
                //called only on the first pair
                else if (memo !== null) { 

                    return [{parent: memo, child: cur}];
                }

                return cur;
            },

            createRelationship = _.wrapCallback(function(rel, callback) {

                return rel.parent.createRelationshipFrom(rel.child, 'IN', callback);
            }),
 
            format = function(node) {

                var data = node._data.data;
                data.id = node._data.metadata.id;

                return  data;
            },

            /**
              * This is the one non-functional thing---it has a side-effect
              */
            saveNodes = function(node) {

                newNodes.push(format(node));

                return node;
            },

            newNodes = [];

        _(path)
            .reduce(null, getLastExistingNodePlusNew)
            .sequence()
            .map(loadNode)
            .sequence()
            .map(saveNodes)
            .reduce(null, getRelationships)
            .sequence()
            .map(createRelationship)
            .stopOnError(function(err) {

                res.status(500).json({ success: newNodes, error: err });
            })
            .apply(function() {

                res.status(201).send(newNodes);
            });
    }
}


module.exports = Methods;
