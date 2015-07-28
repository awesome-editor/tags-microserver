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
        };


    //http://expressjs.com/guide/routing.html
    //http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html


    router.post('/', createDoc);
    router.get('/:id', getDoc);
    router.put('/:id', updateDoc);
    router.delete('/:id', deleteDoc);

    return router;
}


module.exports = {bindRoutes: bindRoutes};
