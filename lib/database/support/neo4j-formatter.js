function bindNeo4jFormatter() {

  function _formatSingleData(result) {
    var data = result.data[0];

    return data ? data.row[0] : '';
  }

  function _formatMultiData(result) {
     return result.data.map(function(row) {
      return row.row; //actually, returns rows
    });
  }

  function formatSingleResultSingleData(results) {
    return formatMultiResultSingleData(results)[0];
  }

  function formatMultiResultSingleData(results) {
    return results.results.map(_formatSingleData);
  }

  function formatSingleResultMultiData(results) {
    return formatMultiResultMultiData(results)[0];
  }

  function formatMultiResultMultiData(results) {
    return results.results.map(_formatMultiData);
  }

  return {
    formatSingleResultSingleData: formatSingleResultSingleData,
    formatMultiResultSingleData: formatMultiResultSingleData,
    formatSingleResultMultiData: formatSingleResultMultiData,
    formatMultiResultMultiData: formatMultiResultMultiData
  };
}

module.exports = {
  bindNeo4jFormatter: bindNeo4jFormatter
};

