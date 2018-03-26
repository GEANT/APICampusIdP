'use strict';
const _ = require('lodash');
const url = require('url');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;
const mongoose = require('mongoose');
const Provider = require('../models/Provider');
const User = require('../models/User');

const eol = require('eol');
const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;
const certGen = require('./certsGen');
const konsole = require('./konsole');

const validator = require('validator');
const isValidDomain = require('is-valid-domain');


const valDelIdPReq = function (req, res, next) {


    if (typeof req.params.name === 'undefined' || _.trim(req.params.name) === '') {
        return res.status(400).json({"error": true, "message": "Missing param"});
    }

    const name = req.params.name;

    if (!isValidDomain(name)) {
        return res.status(400).json({"error": true, "message": "Incorrect param"});
    }

    Provider.findOne({name: name}).populate('creator').then((provider) => {

        if (provider !== null) {
            res.locals.provider = provider;

            next();
        }
        else {
            return res.status(404).json({"error": true, "message": "Not found"});
        }
    }).catch((error) => {
        return res.status(404).json({"error": true, "message": "Not found"});

    });


};
const isAllowedToDelIdP = function (req, res, next) {
    if (typeof res.locals.provider === 'undefined') {
        return res.status(404).json({"error": true, "message": "zzNot found"});
    }
    const provider = res.locals.provider;
    if (!(('creator' in provider) && ('username' in provider.creator))) { // && provider.creator.hasOwnProperty('username')){
        return res.status(401).json({"error": true, "message": "Not authorized"});
    }

    if (res.locals.tokenDecoded.sub.toUpperCase() !== provider.creator.username.toUpperCase()) {
        return res.status(401).json({"error": true, "message": "Not authorized..."});
    }


    next();
};

const processToDelIdP = function (req, res, next) {

    const provider = res.locals.provider;
    provider.remove().then(()=>{
        next();
    }).catch((err)=>{
        res.status(500).json({"error": true, "message": err});
    });

};

module.exports.valDelIdPReq = valDelIdPReq;
module.exports.isAllowedToDelIdP = isAllowedToDelIdP;
module.exports.processToDelIdP = processToDelIdP;