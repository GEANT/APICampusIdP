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
const context = vocab;
const myVocab = context['@vocab'];
const validator = require('validator');
const isValidDomain = require('is-valid-domain');
const configGenHelper = require('./configGenHelper');




const valDelIdPReq = function (req, res, next) {

    next();
};
const isAllowedToDelIdP = function (req, res, next) {

    next();
};

const processToDelIdP = function (req, res, next) {

    next();
};

module.exports.valDelIdPReq = valDelIdPReq;
module.exports.isAllowedToDelIdP = isAllowedToDelIdP;
module.exports.processToDelIdP = processToDelIdP;