const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const User = require("../models/User");

router.post("/", function (req, res) {
    const app = req.app;
    const jwtConfig = req.app.get("appConfig").get("jwt");
    if (!req.body.name || !req.body.password) {
        res
            .status(401)
            .send({
                success: false,
                message: "Authentication failed. Username/Password not provided "
            });
    } else {
        const name = req.body.name;
        const password = req.body.password;
        let userPromise =  User.findOne({username: name, enabled: true}).select('+password');

        userPromise.then(
            user => {
                if(user === null ){
                    res
                        .status(401)
                        .send({success: false, message: "Authentication failed."});
                }
                else {
                    user.checkPassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            let data = {
                                username: name
                            };
                            let token;
                            if (jwtConfig.alg === "HS256") {
                                token = jwt.sign(
                                    {
                                        iss: jwtConfig.iss,
                                        sub: name
                                    },
                                    jwtConfig.secret,
                                    {
                                        algorithm: "HS256",
                                        expiresIn: jwtConfig.expiresInSeconds + "s"
                                    }
                                );
                            } else if (jwtConfig.alg === "RS256") {
                                if (jwtConfig.privateKey) {
                                    const filename = jwtConfig.privateKey;
                                    const cert = fs.readFileSync(
                                        __dirname + "/../etc/certs/" + filename
                                    );
                                    token = jwt.sign(
                                        {
                                            iss: jwtConfig.iss,
                                            sub: name
                                        },
                                        cert,
                                        {
                                            algorithm: "RS256",
                                            expiresIn: jwtConfig.expiresInSeconds + "s"
                                        }
                                    );
                                } else {
                                    throw new Error("privateKey in config is not defined");
                                }
                            }
                            res.send({success: true, message: "authn ok", token: token});
                        } else {
                            res
                                .status(401)
                                .send({
                                    success: false,
                                    message: "Authentication failed. Wrong password."
                                });
                        }
                    });
                }
            }
        ).catch(err => console.error(err));
    }
});

module.exports = router;
