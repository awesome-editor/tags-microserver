function noop() {}


function isArray(obj) {

    return obj !== null && Object.prototype.toString.call( obj ) === '[object Array]';
}


function uniq(a) {

    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
        var item = a[i];
        if(seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}


module.exports.noop = noop;
module.exports.isArray = isArray;
module.exports.uniq = uniq;