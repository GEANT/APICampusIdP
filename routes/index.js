
const express = require('express');
const router = express.Router();
const serviceConfig = require('../libs/serviceConfig');


/* GET home page. */
router.get('/', function (req, res, next) {
    const entryPoints = {
        "@context": {},
        "entrypoints" : {
            "authentication" : {
                "url": req.app.get('baseurl')+'authenticate',
                "methods" : "post"
            },
            "registration":{
                "url": req.app.get('baseurl')+'users/register',
                "methods": "post"
            },
            "user" : {
                "url" : req.app.get('baseurl')+'users',
                "methods" : ["post","get"]
            },
            "idp" : {
                "url": req.app.get('baseurl')+'idp',
                "methods" : ["post", "get", "delete", "put"]
            }
        }
    };
    res.json(entryPoints);
});

module.exports = router;
