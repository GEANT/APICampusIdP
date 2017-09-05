var express = require('express');
var router = express.Router();
var _ = require('lodash');

var schema = require('../libs/apiVocab').schema;

router.get('/', function(req,res){
    var reqAccepts = req.accepts();
    var responseType = 'application/json';
    if(_.indexOf(reqAccepts, 'application/ld+json') >= 0){
        responseType = 'application/ld+json';
    }
    res.contentType(responseType).json(

        schema

    );

});
module.exports = router;