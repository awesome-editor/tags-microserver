//express stuff
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


//microservice stuff
var Routes = require('./lib/routes/tag-routes');
var config = require('./config.json');

var Database = require('./database/neo4j').Database;
var db = new Database();


//setup service
var app = express();


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.use('/tags', new Routes(db));


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
