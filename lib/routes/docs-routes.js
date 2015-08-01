function bindRoutes(opts) {

    //Dependencies
    var db = opts.db,
        express = opts.express;


    //TODO use streams

    var router = express.Router(),

        createDoc = function(req, res, next) {

            db.createDoc(req.body).apply(function(data) {

                res.status(201).send(data);
            });
        },

        getDoc = function(req, res, next) {

            db.getDoc(req.params.id).apply(function(data) {

                res.status(200).send(data);
            });
        },

        updateDoc = function(req, res, next) {

            db.updateDoc(req.params.id, req.body).apply(function(data) {

                res.status(200).send(data);
            });
        },

        deleteDoc = function(req, res, next) {

            db.deleteDoc(req.params.id).apply(function(data) {

                res.status(204).send(data);
            });
        },

        addTagsToDoc = function(req, res, next) {

          db.addTagsToDoc({uuid:req.params.id, tags:req.body.tags}).apply(function(data) {

            res.status(201).send(data);
          });
        },

        docTags = function(req, res, next) {

          db.docTags(req.params.id).apply(function(data) {

            res.status(200).send(data);
          });
        },

        removeTagsFromDoc = function(req, res, next) {

          db.removeTagsFromDoc(req.params.id).apply(function(data) {

            res.status(204).send(data);
          });
        },

        suggestedTagCloud = function(req, res) {

          db.suggestedTagClouds(req.body).apply(function(data) {

            res.status(200).send(data);
          });
        };


    //http://expressjs.com/guide/routing.html
    //http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html


    router.post('/', createDoc);
    router.get('/:id', getDoc);
    router.put('/:id', updateDoc);
    router.delete('/:id', deleteDoc);

    router.post('/:id/tags', addTagsToDoc);
    router.get('/:id/tags', docTags);
    router.put('/:id/tags', addTagsToDoc);
    router.delete('/:id/tags', removeTagsFromDoc);

    router.get('/:id/suggested-tag-cloud', suggestedTagCloud);


    return router;
}


module.exports = {bindRoutes: bindRoutes};
