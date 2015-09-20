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
    _ = require('lodash'),
    h = require('highland'),
    uuid = require('uuid'),

    textRank = require('text-rank');

function Deps() {

    this.c = require('./lib/common/common');

    this.Post = require('./lib/database/post');
    this.post = new this.Post(config.tags.database, http);

    this.db = require('./lib/database/neo4j').bindNeo4j({
      c: this.c,
      _: _,
      h: h,
      uuid: uuid,
      httpPost: this.post,
      textRank: textRank
    });

    this.validators = require('./lib/routes/validators');

    this.docsRoutes = require('./lib/routes/docs-routes').bindRoutes({
        db: this.db,
        express: express
    });

    this.tagRoutes = require('./lib/routes/tag-routes').bindRoutes({
        db: this.db,
        express: express
    });

/*    this.tagroutes = require('./lib/routes/tag-routes').bindRoutes({
        db: this.db,
        _: h,
        express: express,
        validators: this.validators
    });*/

    //this.Adminroutes = require('./lib/routes/admin-routes');
    //this.adminroutes = new this.Adminroutes(this.db, express);

    this.SSAEngine = require('./lib/ssa/ssa-engine');
    this.ssaEngine = new this.SSAEngine(_);


    this.Taglist = require('./lib/tag-list/tag-list');
    this.taglist = new this.Taglist(
        h, this.db, this.ssaEngine, null, {k: 3, sim: {}}
    );
}

var deps = new Deps();


//setup service
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/docs', deps.docsRoutes);
app.use('/tags', deps.tagRoutes);
//app.use('/admin/', deps.adminroutes);

// catch 404 and forward to error handler
/*app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});*/


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
