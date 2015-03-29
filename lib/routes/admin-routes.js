function Routes(db, express) {

    var router = express.Router();


    function _fetchAllTags(req, res, next) {

        db.fetchAllTags().apply(function(data) {

            res.status(200).send(data)
        })
    }

    function _createIndexes(req, res, next) {

        db.createIndexes().apply(function(data) {

            res.status(201).send(data)
        })
    }


    router.get('/all-tags', _fetchAllTags)
    router.post('/indexes', _createIndexes)


    return router
}


module.exports = Routes; 
