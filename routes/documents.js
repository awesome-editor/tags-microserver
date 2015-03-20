var express = require('express');
var router = express.Router();

var fs = require('fs');

var docModel = fs.readFileSync( __dirname + '/../models/document.json');

//http://expressjs.com/guide/routing.html
//http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html

//TODO use UUIDs

var documents = function(db) {

    var documents = db.get('documents');

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


    return router;
}	


module.exports = documents;
