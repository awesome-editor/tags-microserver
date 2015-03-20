var express = require('express');
var router = express.Router();

var documents = function(db) {

    router.get('/', function(req, res, next) {

        var documents = db.get('documents'),
            collection = db.get('usercollection');

        collection.find({},{},function(e,docs) {

            res.json(docs);
        });
    });

    return router;
}	


module.exports = documents;
