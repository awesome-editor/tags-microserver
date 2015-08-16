var formatter = require('../lib/database/support/neo4j-formatter').bindNeo4jFormatter();

describe('formatter', function() {

  var results;

  beforeEach(function() {
    results = {
      'results': [
        {
          'data': [
            {
              'row': [
                '1.1'
              ]
            },
            {
              'row': [
                '1.2'
              ]
            },
            {
              'row': [
                '1.3'
              ]
            }
          ]
        },
        {
          'data': [
            {
              'row': [
                '2.1'
              ]
            },
            {
              'row': [
                '2.2'
              ]
            }
          ]
        }
      ]
    };
  });


  it('parses single result, single data', function() {

    expect(formatter.formatSingleResultSingleData(results)).toEqual('1.1');
  });

  it('parses multi result, single data', function() {

    expect(formatter.formatMultiResultSingleData(results)).toEqual([
      '1.1', '2.1'
    ]);
  });

  it('parses multi result, multi data', function() {

    expect(formatter.formatMultiResultMultiData(results)).toEqual([
      [['1.1'], ['1.2'], ['1.3']], [['2.1'], ['2.2']]
    ]);
  });
});