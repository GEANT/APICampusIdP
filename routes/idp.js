'use strict';
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const konsole = require('../libs/konsole');
const base64url = require('base64url');
const Provider = require('../models/Provider');
const User = require('../models/User');
const verifyToken = require('../libs/verifyToken');
const vocab = require('../libs/apiVocab').context;
const jsonld = require('jsonld');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');

const actionsIdP = require('../libs/actionsIdp');
const validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;
const serviceValidatorRequest = require('../libs/validators').serviceValidatorRequest;
const filterOutput = require('../libs/filterOutput').hideSensitive;
const convertToAnsible = require('../libs/convertToAnsible').translateToYaml;
const yaml = require('write-yaml');
const configGenHelper = require('../libs/configGenHelper');
const generateYaml = require('../libs/idpConfYamlGen').generateYaml;
const yamljs = require('yamljs');
const url = require('url');

const eol = require('eol');
const generatesYamlFiles = function (cnf) {

    // generate attribute resolver part
    // go through objects and check '@type' === 'AttributeDefinition'

};


/**
 * create new service
 */
router.post('/', verifyToken, serviceValidatorRequest, configGenHelper.configGen, function (req, res) {
    if (typeof req.inputhostname === 'undefined') {
        return res.status(400).json({"error": true, "message": "Missing hostname"});
    }
    if(typeof res.app.locals.entityID === 'undefined'){
        return res.status(400).json({"error": true, "message": "Missing entityid"});
    }
    if(req.inputhostname !== url.parse(res.app.locals.entityID).hostname ){
        return res.status(400).json({"error": true, "message": "entityID does not match hostname"});
    }
    let username = res.locals.tokenDecoded.sub;
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
        let newProvider = new Provider({
            name: req.inputhostname,
            status: 'pending',
            configs: [{
                format: "flatcompact",
                flatcompact: res.app.locals.srvConfFlatCompact,
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
    konsole('>>>DONE<<<');

});
router.post('/:name', verifyToken, serviceValidatorRequest,
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


router.get('/:name/:filter', verifyToken, (req, res) => {
    let name = req.params.name;
    let detail = req.params.filter;
    let pProvider = Provider.findOne({name: name});
    pProvider.then(
        result => {
            if (result) {
                let filteredRes = filterOutput(result);
                if (detail === 'configuration') {
                    // @todo TEST to store ansible playbook
                    res.json(filteredRes.configs);
                }
                else if(detail === 'yamlconf'){
                    console.log('yamlconf: '+JSON.stringify(filteredRes));
                    let yamlconf = yamljs.stringify(JSON.parse(generateYaml(filteredRes,1)),10);
                    //res.json({ res: 'yaml'});
                    res.send(yamlconf);

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

router.delete('/:name',verifyToken, (req,res)=>{
    const username = res.locals.tokenDecoded.sub;
    const name = req.params.name;
    Provider.findOne({name: name}).then((myProvider) => {
      if(myProvider === null){
          return res.status(404).json({"error": true, "message": "Not found"});
      }
      else {
          User.findOne({_id: myProvider.creator}).then(creator => {
              if (creator.username !== username) {
                  return res.status(401).json({"error": true, "message": "Access den"});
              }
              else {
                  res.json({"error": false, "message": "OK"});
              }

          }).catch(err => {
              return res.status(404).json({"error": true, "message": "Not found"});
          })

      }
    }).catch(reject =>{
        res.send(err);
    });
});

module.exports = router;

