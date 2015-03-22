/**
 * Checks that req.body is tag (path) of the form

 * [new_node+] OR
 * [existing_node+, new_node+]
 *
 * Ex: var tag1 = [ {name: 'ai'}, {name: 'CNN'}]
 * 
 * Ex: var tag2 = [ 
 *   {id: //some id, name: 'appendix'},
 *   {id: //another id, name: 'linear alegbra'},
 *   {name: 'kernel'} 
 * ]
 * 
 */
function validatePathCreation(req, res, next) {

    if (Object.prototype.toString.call( req.body ) !== '[object Array]') {

        throw('Must be an array');
    }

    var path = req.body,

        lastIndexExistingNode = -1,
        firstIndexNewNode = path.length - 1;

    for(var i=path.length-1; i>=0; i--) {

        if (path[i].hasOwnProperty('id')) {

            lastIndexExistingNode = i;
            break;
        }
    }

    for(var j=0; j<path.length; j++) {

        if (!path[j].hasOwnProperty('id')) {

            firstIndexNewNode = j;
            break;
        }
    }

    if (firstIndexNewNode<lastIndexExistingNode) {
        throw "Tried to create an impossible path";
    }

    next();
}

module.exports.validatePathCreation = validatePathCreation;