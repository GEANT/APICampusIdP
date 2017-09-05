const express = require('express');
const router = express.Router();
const _ = require('lodash');
const base64url = require('base64url');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');
const verifyToken = require('../libs/verifyToken');
const vocab = require('../libs/apiVocab').context;
const jsonld = require('jsonld');



const validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;
const validateReq = require('../libs/validators').serviceValidatorRequest;



var generatesYamlFiles = function(cnf){

    // generate attribute resolver part
    // go through objects and check '@type' === 'AttributeDefinition'

};


/**
 * create new service
 */
router.post('/',verifyToken, validateReq, function (req, res) {
    console.log('----------START REQUEST----------------');


    console.log('res '+JSON.stringify(req.jsonldexpanded));



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

