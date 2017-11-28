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
            }
        }
    };
    res.json(entryPoints);
});

module.exports = router;
