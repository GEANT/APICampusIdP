const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = function (req, res, next) {
    const jwtConfig = req.app.get('appConfig').get('jwt');
    const iss = jwtConfig.iss;
    var token = req.body.token || req.query.token || (function () {
        var authzBearer = req.headers.authorization;
        if (authzBearer && authzBearer.split(' ')[0] === 'Bearer') {
            return authzBearer.split(' ')[1];
        }
        return null;
    }).call();

    if (token) {
        let secret;
        if (jwtConfig.alg === "HS256") {
            secret = jwtConfig.secret;
        }
        else if (jwtConfig.alg === "RS256" && jwtConfig.privateKey && jwtConfig.publicKey) {
            let filename = jwtConfig.publicKey;
            secret = fs.readFileSync(__dirname + '/../etc/certs/' + filename);
        }
        else {
            throw new Error('privateKey in config is not defined');
        }

        jwt.verify(token, secret, { algorithms: [jwtConfig.alg], issuer: jwtConfig.iss}, function (err, decoded) {
            if (err) { //failed verification.

                return res.status(401).json({"error": true, "message": "Authorization failed"});
            }
            req.tokenDecoded = decoded;
            next(); //no error, proceed
        });

    } else {
        // forbidden without token
        return res.status(401).send({
            "error": true,
            "message": "Authorization failed."
        });
    }
};

