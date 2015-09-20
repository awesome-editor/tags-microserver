function bindRoutes(opts) {

    //Dependencies
    var db = opts.db,
        _ = opts._,
        express = opts.express;


    //Express boiler plate

    var router = express.Router(),

        createPath = function(req, res, next) {

            db.createPath(req.body).apply(function(data) {

                res.status(201).send(data);
            });
        },

        rawSuggestedTagCloud = function(req, res) {

            db.rawSuggestedTagCloud(req.body).apply(function(data) {

               res.status(200).send(data);
            });
        },

      SSA = function(req, res) {

        db.SSA(req.body).apply(function(data) {

          res.status(200).send(data);
        });
      };


    //http://expressjs.com/guide/routing.html
    //http://www.vincent-durmont.com/2013/11/29/first-rest-api-with-node-express-monk-and-mongodb.html


    router.get('/', function(req, res) {

        res.status(200).send('hello');
    });

    /*router.get('/:id', function(req, res, next) {

        var id = req.params.id;

        documents.findById(id, function(err, doc) {
        
            if (err) res.status(500).json(err);
            else if (doc) res.json(doc);
            else res.status(404);
        });
    });*/

    router.post('/', createPath);

    /**
     * Given list of tags, find suggested parents
     */
    /*router.post('/suggested-parents', null);

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
*/

    router.post('/cloud/suggested', rawSuggestedTagCloud);
    router.post('/ssa', SSA);


    return router;
}


module.exports = {bindRoutes: bindRoutes};
