var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var fs = require('fs');
var User = require('../models/User');


router.post('/', function (req, res) {
    var app = req.app;
    var jwtConfig = req.app.get('appConfig').get('jwt');
    if (!req.body.name || !req.body.password) {
        res.status(401).send({success: false, message: 'Authentication failed. Username/Password not provided '});
    }
    else {
        var name = req.body.name;
        var password = req.body.password;

        User.findOne({username: name}, function (err, user) {
            if (err) return console.error(err);
            if (!user) {
                res.status(401).send({success: false, message: 'Authentication failed. User not found.'});
            }
            else {
                user.checkPassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        var data = {
                            username: name
                        };
                        var token;
                        if (jwtConfig.alg === "HS256") {
                            token = jwt.sign({
                                data: data
                            }, jwtConfig.secret, {algorithm: 'HS256', expiresIn: jwtConfig.expiresInSeconds + 's'});
                        }
                        else if (jwtConfig.alg === "RS256") {
                            if (jwtConfig.privateKey) {
                                var filename = jwtConfig.privateKey;
                                var cert = fs.readFileSync(__dirname + '/../etc/certs/' + filename);
                                token = jwt.sign({
                                    data: data
                                }, cert, {algorithm: 'RS256', expiresIn: jwtConfig.expiresInSeconds + 's'});
                            }
                            else {
                                throw new Error('privateKey in config is not defined');
                            }
                        }
                        res.send({success: true, message: "authn ok", token: token});
                    }
                    else{
                        res.status(401).send({success: false, message: 'Authentication failed. Wrong password.'});
                    }
                });
            }
        });
    }
});


module.exports = router;