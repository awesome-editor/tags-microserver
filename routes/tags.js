var _ = require('highland');
var express = require('express');


var noop = function() {}


function tags(db) {


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
     */
    function create(req, res, next) {

        var tags = req.body,

            getNewNodes = function(total, cur) {

                if (!cur.hasOwnProperty('id')) total.push(cur);

                return total;
            },

            createNodes = function(node) {

                return db.createNode(node);
            },

            saveNodes = function(node) {

                return node.save();
            },

            newNodes = _(tags).reduce([], getNewNodes);

        newNodes.map(createNodes).map(saveNodes)
    }

    this.validatePath = function(req, res, next) {

        if (Object.prototype.toString.call( req.body ) !== '[object Array]') {

            res.status(400).json('Must be an array of arrays');
        }

        var tags = req.body,

            validator = function(path) {

                if (Object.prototype.toString.call( path ) !== '[object Array]') {

                    res.status(400).json('Must be an array of arrays');
                }

                var lastIndexExistingNode = -1,
                    firstIndexNewNode = path.length - 1;

                for(var i=path.length-1; i>=0; i--) {

                    if (path[i].hasOwnProperty('id')) {

                        lastIndexExistingNode = i;
                        break;
                    }
                }

                for(var j=0; j<path.length; j++) {

                    if (!path[j].hasOwnProperty('id')) {

                        firstIndexNewNode = j;
                        break;
                    }
                }

                if (firstIndexNewNode<lastIndexExistingNode) throw "Tried to create an impossible path"
            },

            result = _(tags)
                .map(validator)
                .stopOnError(function(err) {

                    res.status(400).json(err)
                });

        result.each(noop); //call validator
    }


    var router = express.Router();


    //http://expressjs.com/guide/routing.html
    //http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html

    //TODO use UUIDs


    router.get('/', function(req, res, next) {

        documents.find({},{},function(e,docs) {

            res.json(docs);
        });
    });

    router.get('/:id', function(req, res, next) {

        var id = req.params.id;

        documents.findById(id, function(err, doc) {
        
            if (err) res.status(500).json(err);
            else if (doc) res.json(doc);
            else res.status(404);
        });
    });

    router.post('/', function(req, res, next) {

        var document = req.body;

        documents.insert(document, function(err, doc) {

            if (err) res.status(500).json(err);
            else if (doc) res.status(201).json(doc);
        });
    });

    router.put('/:id', function(req, res, next) {

        var id = req.params.id;

        var body = req.body;
        delete body._id;

        documents.findAndModify(
            {_id: id}, 
            {$set: body},
            {multi:false}, 
            
            function(err, doc){

                if (err) res.status(500).json(err);
                else if (doc) res.json(doc);
                else res.status(404);
        });
    });


    this.router = router;
}

module.exports = tags; 
