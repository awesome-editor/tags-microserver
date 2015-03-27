function Routes(db, express) {

    var router = express.Router(),

        fetchAllTags = function(req, res, next) {

            db.fetchAllTags().apply(function(data) {

                res.status(200).send(data);
            });
        };


    router.get('/all-tags', fetchAllTags);


    return router;
}


module.exports = Routes; 
