var http = require('http');


function Post(options) {

    this.post = post;


    function post(data, callback) {

        var dataString = JSON.stringify(data),

            postOptions = {

              host: options.host,
              port: options.port,
              path: options.path,
              method: 'POST',
              headers: {
                  'Accept': 'application/json; charset=UTF-8',
                  'Content-Type': 'application/json',
                  'Content-Length': dataString.length
              }
            };

        // Set up the request
        var req = http.request(postOptions, function(res) {
          
            var responseString = '';

            res.setEncoding('utf-8');

            res.on('data', function(data) { 

                responseString += data; }
            );

            res.on('end', function() { 

                callback(null, JSON.parse(responseString));
            });
        });

        req.on('error', function(e) {
        
            callback(e, null);
        });

        req.write(dataString);
        req.end();
    }
}


module.exports = Post;
