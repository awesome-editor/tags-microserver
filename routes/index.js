var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    res.sendStatus(403);    
    res.send('You don\'t belong anywhere');
});


module.exports = router;
