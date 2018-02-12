const _ = require('lodash');
const jsonld = require('jsonld');


const konsole = require('./konsole');
const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;

const context = vocab;
const myVocab = context['@vocab'];

const generateYamlVer1 = function (inputConf) {

};

const generateYaml = function(inputConf,version = 1){
    let result;
    if(version === 1){
        result = generateYamlVer1(inputConf);
    }

    return result;

};


module.exports.generateYaml = generateYaml;