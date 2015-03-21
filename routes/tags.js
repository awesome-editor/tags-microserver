var _ = require('highland');
var fibrous = require('fibrous');

var express = require('express');


var noop = function() {};


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


            var path = req.body,

            getNewNodes = function(total, cur) {

                if (!cur.hasOwnProperty('id')) total.push(cur);

                return total;
            },

            createNode = function(node) {
 


                return q.wait();
            },

            newNodes = [],
            nodesToCreate = _(path).reduce([], getNewNodes);


        nodesToCreate.sequence().each(function(node) {
            
            newNodes.push(createNode(node));
        });

        res.status(201).send(newNodes);

    //});
    }

    /**
     * This is a really ugly son of a gun.
     * (1st attempt at highland)
     */
    function validatePath(req, res, next) {

        if (Object.prototype.toString.call( req.body ) !== '[object Array]') {

            throw('Must be an array');
        }

        var path = req.body,

            lastIndexExistingNode = -1,
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

        if (firstIndexNewNode<lastIndexExistingNode) {
            throw "Tried to create an impossible path";
        }

        next();
    }


    var router = express.Router();


    //http://expressjs.com/guide/routing.html
    //http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html

    //TODO use UUIDs


    router.get('/', function(req, res) {

        res.status(200).send('hello');
    });

    router.get('/:id', function(req, res, next) {

        var id = req.params.id;

        documents.findById(id, function(err, doc) {
        
            if (err) res.status(500).json(err);
            else if (doc) res.json(doc);
            else res.status(404);
        });
    });

    router.post('/', validatePath, create);

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


    this._validatePath = validatePath;
    this.router = router;
}

module.exports = tags; 
