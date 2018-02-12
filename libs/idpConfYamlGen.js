const _ = require('lodash');
const jsonld = require('jsonld');


const konsole = require('./konsole');
const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;

const context = vocab;
const myVocab = context['@vocab'];



const sample =   {
    flatcompact: {
        context: {
            vocab: "http://geant.org/schema/campusidp/",
            apiVersion: "xsd:string"
        },
        zupa: [
            {
                dfddf: "sdfsd"
            },
            "dfsdfsdfsd"
        ],
        ver: "3bcfc8f0-0763-11e8-be7a-f3a02163c88d",
        _id: "5a732fe67851ed112fcca5b7",
        approved: false,
        status: "pending"
    }
};


const generateYamlVer1 = function (inputConf) {

    return JSON.stringify(sample);
};

const generateYaml = function(inputConf,version = 1){
    console.log('generateYaml triggered');
    let result;
    if(version === 1){
        console.log('generateYaml condition passed');
        result = generateYamlVer1(inputConf);
    }

    console.log('generateYaml: '+JSON.stringify(result));
    //result = {"@id": "zupa"};
    //console.log('generateYaml: '+JSON.stringify(result));
    return result;

};


module.exports.generateYaml = generateYaml;