var config = require('../config.json');
var monk = require('monk');

var db = monk(config.host+'/'+config.dbname);

var express = require('express');
var router = express.Router();


//http://expressjs.com/guide/routing.html
//http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html

//TODO use UUIDs

var docModel = require('../models/document.json');
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


module.exports = router;
