const _ = require('lodash');
const fs = require('fs');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;
var vocab = require('./apiVocab').context;
var schema = require('./apiVocab').schema;
const konsole = require('./konsole');

var context = vocab;
var myVocab = context['@vocab'];
const yaml = require('write-yaml');
const writeData = require('write-data');
const json2yaml = require('json2yaml');


const translateToAnsible = function (input) {

    konsole(JSON.stringify(input));
    return new Promise(function(resolve,reject){
        let frame = {
            "@context" : vocab,
            "@type":  myVocab+"ServiceDescription"
        };
        const framed = jsonldPromises.frame(input,frame);
        framed.then(
            function(res,rej){
                if(rej){
                    reject(rej);
                }
                if(res){
                    resolve(res);
                }
            }
        );
    });




};

module.exports.translateToYaml = translateToAnsible;