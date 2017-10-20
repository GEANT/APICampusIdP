const express = require('express');
const router = express.Router();
const _ = require('lodash');
const konsole = require('../libs/konsole');
const base64url = require('base64url');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');
const verifyToken = require('../libs/verifyToken');
const vocab = require('../libs/apiVocab').context;
const jsonld = require('jsonld');
const uuidv1 = require('uuid/v1');

const validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;
const validateReq = require('../libs/validators').serviceValidatorRequest;
const filterOutput = require('../libs/filterOutput').hideSensitive;
const convertToAnsible = require('../libs/convertToAnsible').translateToYaml;
const yaml = require('write-yaml');


var generatesYamlFiles = function (cnf) {

    // generate attribute resolver part
    // go through objects and check '@type' === 'AttributeDefinition'

};


/**
 * create new service
 */
router.post('/', verifyToken, validateReq, function (req, res) {
    konsole('----------START REQUEST----------------');



    konsole('res ' + JSON.stringify(req.jsonldexpanded));
    konsole(`flatten: ${JSON.stringify(req.jsonflatten)}`);

    if (typeof req.inputhostname === 'undefined') {
        return res.status(404).json({"error": true, "message": "Missing hostname"});
    }

    let query = Provider.findOne({name: req.inputhostname});
    let promise = query.exec();

    promise.then(function (doc) {
        if (doc === null) {
            let newProvider = new Provider({
                name: req.inputhostname,
                status: 'pending',
                configuration: {
                    format: "flatcompact",
                    data: req.jsoncompactflatten,
                    version: uuidv1()
                }
            });
            let promise = newProvider.save();
            promise.then(function (doc) {
                //res.json(doc);
                res.json({
                    'error' : false,
                    'message': 'request received'
                });
            }, function(err){
                 res.status(500).json({
                    'error' : true,
                    'message': err
                });
            });

        }
        else {
            return res.status(409).json({"error": true, "message": "host already exist"});
        }
    }).catch(function (error) {
        return res.status(404).json({"error": true, "message": "" + error + ""});
    });


    konsole('----------END REQUEST------------');

});
router.post('/:name', verifyToken, validateReq,
    function (req, res, next) {
        let name = req.params.name;
        if (typeof req.inputhostname === 'undefined') {
            return res.status(400).json({"error": true, "message": "Missing hostname"});
        }


        Provider.findOne({name: name}, function (err, result) {
            if (!err) {
                if (result) {


                    var mydata = result.data;

                    res.json(mydata)
                }
                else {
                    res.status(404).json({"error": true, "message": "Not found"});
                }
                konsole(result);
            }
            else {
                res.send(err);
            }
        });
    }
);



router.get('/:name/:filter', verifyToken, function (req, res, next) {
    konsole('nameIDP: ' + JSON.stringify(req.params));

    let name = req.params.name;
    let detail = req.params.filter;

    Provider.findOne({'name': name}, function (err, result) {
        if (!err) {
            if (result) {
                let filteredRes = filterOutput(result);
                if (detail === 'configuration') {

                    // TEST to store absible playbook
                    let convertedToAnsible = convertToAnsible(result.configuration.data);
                    convertedToAnsible.then(function (resolve, reject) {
                        if (resolve) {

                            // temporary test
                            yaml.sync('zupa.yaml', resolve);
                        }
                    });





                    res.json(filteredRes.configuration)
                }
                else {
                    res.json(filteredRes)
                }

            }
            else {
                res.status(404).json({"error": true, "message": "Not found"});
            }
        }
        else {
            res.send(err);
        }
    });


});


module.exports = router;

