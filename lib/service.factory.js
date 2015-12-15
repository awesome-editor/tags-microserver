function bindServiceLocator(deps, appRoot) {

  const express = deps.express;
  const path = deps.path;
  const favicon = deps.favicon;
  const logger = deps.logger;
  const cookieParser = deps.cookieParser;
  const bodyParser = deps.bodyParser;

  const http = deps.http;
  const _ = deps._;
  const h = deps.h;
  const uuid = deps.uuid;

  const textRank = deps.textRank;

  const common = deps.common;
  const Post = deps.Post;
  const bindNeo4j = deps.bindNeo4j;
  const validators = deps.validators;
  const bindDocRoutes = deps.bindDocRoutes;
  const bindTagRoutes = deps.bindTagRoutes;

  const SSAEngine = deps.SSAEngine;
  const Taglist = deps.Taglist;


  const config = require(path.join(appRoot, 'config.json'));

  const app = express();

  const post = new Post(config.tags.database, http);

  const db = bindNeo4j({
    c: common,
    _,
    h,
    uuid,
    httpPost: post,
    textRank
  });

  const docRoutes = bindDocRoutes({
    db,
    express
  });

  const tagRoutes = bindTagRoutes({
    db,
    express
  });

  const ssaEngine = new SSAEngine(_);

  const taglist = new Taglist(
    h, db, ssaEngine, null, {k: 3, sim: {}}
  );

  return {
    app,
    bodyParser,
    docRoutes,
    tagRoutes,
    ssaEngine,
    taglist,
    validators,
    config
  };
}

module.exports = {
  bindServiceLocator
};
