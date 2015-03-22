var _ = require('highland'),
    validators = require('./validators'),
    Methods = require('./tag-methods'),

    express = require('express');


function Routes(db) {


    var router = express.Router(),

        methods = new Methods(db);




    function mv(data) {

        var node = data.node,
            from = data.from,
            to = data.to;


    }

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

    router.post('/', validators.validatePathCreation, methods.create);

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


module.exports = Routes; 
