const express = require('express');
const router = express.Router();
const serviceConfig = require('../libs/serviceConfig');

const baseUrl = serviceConfig.get('baseUrl');
const entryPoints = {
    "@context": {},
    "entrypoints" : {
        "authentication" : {
            "url": baseUrl+'authenticate',
            "methods" : "post"
        }
    }
};
/* GET home page. */
router.get('/', function (req, res, next) {
    res.json(entryPoints);
});

module.exports = router;
