module.exports.express = require('express');
module.exports.path = require('path');
module.exports.favicon = require('serve-favicon');
module.exports.logger = require('morgan');
module.exports.cookieParser = require('cookie-parser');
module.exports.bodyParser = require('body-parser');

module.exports.http = require('http');
module.exports._ = require('lodash');
module.exports.h = require('highland');
module.exports.uuid = require('uuid');

module.exports.textRank = require('text-rank');

module.exports.common = require('./common/common.js');
module.exports.Post = require('./database/post.js');
module.exports.bindNeo4j = require('./database/neo4j').bindNeo4j;
module.exports.validators = require('./routes/validators.js');
module.exports.bindDocRoutes = require('./routes/docs-routes').bindRoutes;
module.exports.bindTagRoutes = require('./routes/tag-routes').bindRoutes;

module.exports.SSAEngine = require('./ssa/ssa-engine');
module.exports.Taglist = require('./tag-list/tag-list');
