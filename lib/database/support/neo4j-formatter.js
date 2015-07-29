function bindNeo4jFormatter() {

  function formatSingleResult(results) {
    return results.results[0].data[0].row[0];
  }

  return {
    formatSingleResult: formatSingleResult
  };
}

module.exports = {
  bindNeo4jDoc: bindNeo4jFormatter
};

