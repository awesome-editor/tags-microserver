const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const http = require('http');
const _ = require('lodash');
const h = require('highland');
const uuid = require('uuid');

const textRank = require('text-rank');

const common = require('./common/common.js');
const Post = require('./database/post.js');
const bindNeo4j = require('./database/neo4j').bindNeo4j;
const validators = require('./routes/validators.js');
const bindDocRoutes = require('./routes/docs-routes').bindRoutes;
const bindTagRoutes = require('./routes/tag-routes').bindRoutes;

const SSAEngine = require('./ssa/ssa-engine');
const Taglist = require('./tag-list/tag-list');


module.exports = {
  express,
  bodyParser,
  path,
  http,
  _,
  h,
  uuid,
  textRank,
  common,
  Post,
  bindNeo4j,
  validators,
  bindDocRoutes,
  bindTagRoutes,
  SSAEngine,
  Taglist
};