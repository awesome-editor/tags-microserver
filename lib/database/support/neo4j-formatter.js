function bindNeo4jFormatter() {

  function formatSingleResult(results) {
    //TODO handle empty response
    var data = results.results[0].data[0];

    return data ? data.row[0] : '';
  }

  function formatMultiResult(results) {
    return results.results.map(function(result) {
      var data = result.data[0];

      return data ? data.row[0] : '';
    });
  }

  function formatMultiData(results) {
    return results.results[0].data.map(function(row) {
      return row.row[0];
    });
  }

  return {
    formatSingleResult: formatSingleResult,
    formatMultiResult: formatMultiResult,
    formatMultiData: formatMultiData
  };
}

module.exports = {
  bindNeo4jFormatter: bindNeo4jFormatter
};

