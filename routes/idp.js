var express = require('express');
var router = express.Router();
var _ = require('lodash');
var base64url = require('base64url');
var Provider = require('../models/Provider');
var mongoose = require('mongoose');
var verifyToken = require('../libs/verifyToken');
var vocab = require('../libs/apiVocab');
var jsonld = require('jsonld');



var validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;
var validateReq = require('../libs/validators').serviceValidatorRequest;



var generatesYamlFiles = function(cnf){

    // generate attribute resolver part
    // go through objects and check '@type' === 'AttributeDefinition'

};


/**
 * create new service
 */
router.post('/', validateReq,function (req, res) {
    console.log('----------START REQUEST----------------');


    console.log('d '+JSON.stringify(req.zupa));



    res.json(req.jsonldexpanded);



    console.log('----------END REQUEST------------');

});


/**
 * @todo add token verification
 */
router.get('/:entityID', function(req,res,next){
    console.log('entityid: ' + JSON.stringify(req.params.entityID));

    var entityID = base64url.decode(req.params.entityID);


    Provider.findOne({'data.entityID': entityID}, function(err, result){
        if(!err) {
            if(result){
                var mydata = result.data;
                res.json(mydata)
            }
            else {
                res.status(404).json({"error":true, "message": "Not found"});
            }
            console.log(result);
        }
        else {
            res.send(err);
        }
    });



});



router.post('/:entityID', verifyToken,
    function(req,res,next){
        var entityID = base64url.decode(req.params.entityID);

        Provider.findOne({entityID: entityID}, function(err, result){
            if(!err) {
                if(result){



                    var mydata = result.data;

                    res.json(mydata)
                }
                else {
                    res.status(404).json({"error":true, "message": "Not found"});
                }
                console.log(result);
            }
            else {
                res.send(err);
            }
        });
    }
);


module.exports = router;

