/**
 *
 * @param c library common.js
 * @param _ highland
 * @param httpPost
 * @constructor
 */
function Common(c, _, httpPost) {

    var that = this;

    this.db = db;
    this.processDBErrors = processDBErrors;


    this.post = _.wrapCallback(function (statements, callback) {

        return httpPost.post({statements: statements}, callback);
    });


    /**
     * Makes the actual db call
     * @param queryStream
     * @returns {*}
     * @private
     */
    function db(queryStream) {

        return queryStream
            .flatMap(that.post)
            .map(processDBErrors);
    }


    function processDBErrors(res) {

        if (c.isArray(res.errors) && res.errors.length > 0) {

            throw res.errors;
        }

        return res;
    }

}


module.exports = Common;