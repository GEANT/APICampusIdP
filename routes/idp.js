const express = require('express');
const router = express.Router();
const _ = require('lodash');
const konsole = require('../libs/konsole');
const base64url = require('base64url');
const Provider = require('../models/Provider');
const User = require('../models/User');
const mongoose = require('mongoose');
const verifyToken = require('../libs/verifyToken');
const vocab = require('../libs/apiVocab').context;
const jsonld = require('jsonld');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');

const validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;
const validateReq = require('../libs/validators').serviceValidatorRequest;
const filterOutput = require('../libs/filterOutput').hideSensitive;
const convertToAnsible = require('../libs/convertToAnsible').translateToYaml;
const yaml = require('write-yaml');


const generatesYamlFiles = function (cnf) {

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
        return res.status(400).json({"error": true, "message": "Missing hostname"});
    }

    let username = req.tokenDecoded.sub;
    let pQuery = Provider.findOne({name: req.inputhostname});
    let pPromise = pQuery.exec();
    let uQuery = User.findOne({username: username});
    let uPromise = uQuery.exec();
    Promise.all([pPromise, uPromise]).then(results => {
        let doc = results[0];
        let user = results[1];
        if (doc !== null) {
            return res.status(409).json({"error": true, "message": "host already exist"});
        }
        let confVersion = uuidv1();
        /* let providerConfig1 = new ProviderConfig_schema({
             format: "flatcompact",
             flatcompact: req.jsoncompactflatten,
             ver: confVersion
         });*/

        let newProvider = new Provider({
            name: req.inputhostname,
            status: 'pending',
            configs: [{
                format: "flatcompact",
                flatcompact: req.jsoncompactflatten,
                ver: confVersion
            }]
        });
        if (user !== null) {
            newProvider.creator = user;
        }
        let sPromise = newProvider.save();
        sPromise.then((doc) => {
            res.json({
                'error': false,
                'message': 'request received'
            });
        }, (err) => {
            res.status(500).json({
                'error': true,
                'message': err
            });
        });
    }).catch(error => {
        return res.status(500).json({"error": true, "message": "" + error + ""});
    });

    konsole('----------END REQUEST------------');

});
router.post('/:name', verifyToken, validateReq,
    (req, res, next) => {
        let name = req.params.name;
        if (typeof req.inputhostname === 'undefined') {
            return res.status(400).json({"error": true, "message": "Missing hostname"});
        }


        let pPromise = Provider.findOne({name: name});
        pPromise.then(
            (result) => {
                if (result !== null) {
                    res.json(result.data)
                }
                else {
                    res.status(404).json({"error": true, "message": "Not found"});
                }
            }
        ).catch(err => {
            res.send(err);
        });

    }
);

router.get('/:name', verifyToken, (req, res) => {
    let name = req.params.name;

    let provider = Provider.findOne({name: name});
    provider.then(
        (result) => {
            if (result === null) {
                res.status(404).json({"error": true, "message": "Not found"});
            }
            else {
                res.json(result);
            }
        }
    ).catch(err => {
        res.json(err);
    });
});


router.get('/:name/:filter', verifyToken, (req, res, next) => {
    let name = req.params.name;
    let detail = req.params.filter;
    let pProvider = findOne({name: name});
    pProvider.then(
        result => {
            if (result) {
                let filteredRes = filterOutput(result);
                if (detail === 'configuration') {
                    // @todo TEST to store absible playbook
                    res.json(filteredRes.configs)
                }
                else {
                    res.json(filteredRes)
                }

            }
            else {
                res.status(404).json({"error": true, "message": "Not found"});
            }
        }
    ).catch(
        err => {
            res.send(err);
        });



});


module.exports = router;

