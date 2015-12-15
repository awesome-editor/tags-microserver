const bindNeo4jCommon    = require('./support/neo4j-common').bindNeo4jCommon;
const bindNeo4jDoc       = require('./support/neo4j-doc').bindNeo4jDoc;
const bindNeo4jFormatter = require('./support/neo4j-formatter').bindNeo4jFormatter;
const bindNeo4jTags      = require('./support/neo4j-tags').bindNeo4jTags;
const bindNeo4jSSA       = require('./support/neo4j-ssa').bindNeo4jSSA;


function bindNeo4j(opts) {

  const _ = opts._;
  const h = opts.h;
  const uuid = opts.uuid;

  const neo4jFormatter = bindNeo4jFormatter();
  const neo4jCommon = bindNeo4jCommon(_.merge({neo4jFormatter}, opts));

  const dbClient = neo4jCommon.db;

  const neo4jDoc = bindNeo4jDoc(_.merge({neo4jFormatter, dbClient}, opts));
  const neo4jTags = bindNeo4jTags(_.merge({neo4jFormatter, dbClient}, opts));
  const neo4jSSA = bindNeo4jSSA(_.merge({
    dbClient,
    neo4jTags,
    neo4jFormatter,
    neo4jCommon
  }, opts));


  function _formatCreate(results) {

    return h([results])
      .pluck('results')
      .sequence() //list results
      .pluck('data')
      .pluck(0)
      .pluck('row')
      .collect();
  }

  function createIndexes() { return dbClient(_createIndexesQuery()); }

  function createPath(data) {
    return dbClient(_createPathQuery(_validateCreatePath(data)))
      .flatMap(_formatCreate);
  }

  function mvDir(data) { return dbClient(_mvDirQuery(data)); }


  function _createIndexesQuery() {

    var query = [
      {
        statement: 'CREATE INDEX ON :Tag(name)' +
                   'CREATE INDEX ON :Tag(uuid)'
      }
    ];

    return h([query]);
  }

  /**
   * Creates a 'path' where path is a sequence of tags.
   *
   * Ex: {newPath: [{name: 'foo'}, {name: 'bar'}]}
   * corresponds to the path 'foo/bar'
   *
   * Every tag in newPath will be recreated.
   *
   * Pass a root if you want to create a path from an existing tag.
   *
   * Ex: {root: {name: 'fu', uuid: //uuid}, newPath: [{name: 'bar'}]
      * corresponds to the path 'fu/bar'
      *
      * The root node must have a uuid.
      *
      */
  function _validateCreatePath(data) {

    const newPath = data.newPath;

    if (!_.isArray(newPath) || newPath.length === 0) {

      throw 'Invalid newPath ' + newPath;
    }

    return data;
  }

  function _createPathQuery(data) {

    var root    = data.root || {uuid: 0, name: '__root__'},
        newPath = data.newPath,

        dirs    = root ? [root].concat(newPath) : newPath;

    return h(dirs)
      .map(_addId)
      .reduce(null, _makeRelationshipPairs)
      .sequence()
      .map(function (pair) {

        return {
          statement: 'MERGE (c:Tag{uuid:{child}.uuid, name:{child}.name}) ' +
                     'MERGE (p:Tag{uuid:{parent}.uuid, name:{parent}.name}) ' +
                     'MERGE (c)-[r:IN]->(p) ' +
                     'RETURN c,p',
          parameters: {
            child: pair.child,
            parent: pair.parent
          }
        };
      })
      .collect();
  }


  function _mvDirQuery(data) {

    var node  = data.node,
        from  = data.from,
        to    = data.to,

        query = [
          {
            statement: 'MATCH ' +
                       '(:Tag{uuid:{node}.uuid})' +
                       '-[r:IN]->' +
                       '(:Tag{uuid:{from}.uuid})' +

                       'DELETE r',
            parameters: {
              node: node,
              from: from
            }
          },
          {
            statement: 'MATCH' +
                       '(c:Tag{uuid:{node}.uuid})' +
                       '-[r:IN]->' +
                       '(p:Tag{uuid:{to}.uuid})' +

                       'MERGE (c)-[:IN]->(p)' +

                       'RETURN c, p',
            parameters: {
              node: node,
              to: to
            }
          }
        ];

    return h([query]);
  }


  function _addId(node) {

    if (!node.hasOwnProperty('uuid')) {

      node.uuid = uuid.v4();
    }

    return node;
  }

  function _makeRelationshipPairs(memo, cur) {

    //the child of the prev pair becomes the parent
    if (_.isArray(memo)) {

      var parent = memo[memo.length - 1].child;

      memo.push({parent: parent, child: cur});

      return memo;
    }
    //called only on the first pair
    else if (memo !== null) {

      return [{parent: memo, child: cur}];
    }

    return cur;
  }

  return _.assign({
      dbClient,

      createIndexes,
      createPath,
      mvDir,

      _createPathQuery,
      _addId,
      _db: neo4jCommon.db
    },
    neo4jCommon,
    neo4jDoc,
    neo4jSSA,
    neo4jTags
  );
}


module.exports = {bindNeo4j: bindNeo4j};

