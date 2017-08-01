var jwt = require('jsonwebtoken');
var fs = require('fs');

module.exports = function(req,res,next) {
    var jwtConfig = req.app.get('appConfig').get('jwt');

    var token = req.body.token || req.query.token || (function(){
        var authbeaer = req.headers.authorization;
        console.log('auhtbear: '+authbeaer);
        if(authbeaer && authbeaer.split(' ')[0] === 'Bearer'){
            return authbeaer.split(' ')[1];
        }
        return null;
    }).call();

    if (token) {

        if (jwtConfig.alg === "HS256") {
            jwt.verify(token, jwtConfig.secret, function(err, decoded) {
                if (err) { //failed verification.
                    return res.json({"error": true});
                }
                req.decoded = decoded;
                next(); //no error, proceed
            });
        }
        else if (jwtConfig.alg === "RS256") {
            if (jwtConfig.privateKey) {
                var filename = jwtConfig.publicKey;
                var cert = fs.readFileSync(__dirname + '/../etc/certs/' + filename);
                jwt.verify(token, cert, function(err, decoded) {
                    if (err) { //failed verification.
                        return res.json({"error": true});
                    }
                    req.decoded = decoded;
                    next(); //no error, proceed
                });
            }
            else {
                throw new Error('privateKey in config is not defined');
            }
        }
    } else {
        // forbidden without token
        return res.status(403).send({
            "error": true
        });
    }
}