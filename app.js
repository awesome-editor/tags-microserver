    //express stuff
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    app = express(),


    //microservice stuff
    config = require('./config.json'),

    http = require('http'),
    $ = require('underscore'),
    _ = require('highland'),
    uuid = require('uuid'),

    Deps = function() {

        this.Post = require('./lib/database/post');
        this.post = new this.Post(config.tags.database, http);

        this.Db = require('./lib/database/neo4j');
        this.db = new this.Db(_, uuid, this.post);


        this.validators = require('./lib/routes/validators');

        this.Tagroutes = require('./lib/routes/tag-routes');
        this.tagroutes = new this.Tagroutes(this.db, _, express, this.validators);

        this.Adminroutes = require('./lib/routes/admin-routes');
        this.adminroutes = new this.Adminroutes(this.db, express);

        this.SsaRecommendationEngine = require('./lib/ssa/ssa');
        this.ssaRecommendationEngine = new this.SsaRecommendationEngine($);


        this.Taglist = require('./lib/tag-list/tag-list');
        this.taglist = new this.Taglist(
            _, this.db, this.ssaRecommendationEngine, null, {k: 3, sim: {}}
        );
    },

    deps = new Deps();


//setup service
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/tags', deps.tagroutes);
app.use('/admin/', deps.adminroutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


//TODO fix error handling
// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
    
//     res.sendStatus(err.status || 500);
//     res.send(err.message);
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {

//   res.sendStatus(err.status || 500);
//   res.send(err.message);
// });

process.env.PORT = config.tags.service.port;

module.exports = app;
