const bindServiceFactory = require('./lib/service.factory.js').bindServiceLocator;
const deps = bindServiceFactory(require('./lib/service.locator.js'), __dirname);

const app = deps.app;
const bodyParser = deps.bodyParser;
const docRoutes = deps.docRoutes;
const tagRoutes = deps.tagRoutes;
const config = deps.config;


//setup service
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/docs', docRoutes);
app.use('/tags', tagRoutes);
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
