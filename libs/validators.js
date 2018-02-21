'use strict';
const _ = require('lodash');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;

const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;
const konsole = require('./konsole');
const context = vocab;
const myVocab = context['@vocab'];


const genKeyWithPref = function (key) {
    return myVocab + key;
};

const validateWebComponent = function (expand) {
    konsole('validateWebComponent: triggered');
    return new Promise(function (resolve, reject) {

        resolve(expand);


        konsole('FG: ' + expand[genKeyWithPref('components')]);
        if (expand[genKeyWithPref('components')] !== undefined && expand[genKeyWithPref('components')][genKeyWithPref('web')]) {
            var myNode = expand[genKeyWithPref('components')][genKeyWithPref('web')];
            konsole('FF: ' + JSON.stringify(myNode));
            resolve(expand);
        }
        else {
            konsole('validateWebComponent : failure');
            reject('components are invalid');
        }


        //https://geant.org/campusidp/web
    });
};

const validateWithSchema = function (obj) {

    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // konsole(` property name = ${Object.keys(obj)}`);
            //  konsole(`obj.${prop} = ${obj[prop]}`);
            if (prop === '@type') {
                //   konsole(`@type is ${obj[prop]}`);
                let z = _.find(schema['@graph'], function (o) {
                    return o['@id'] == obj[prop] && o['@type'] == 'rdfs:Class';
                });
                //   konsole(`dd ::: ${z} for ${obj[prop]}`);
                if (typeof  z === 'undefined') {
                    throw `@type  : ${obj[prop]}  is not recognized by the schema`;
                }
            }
            else if (!prop.startsWith('@') && isNaN(prop)) {
                // konsole(`Property name found: ${prop}`);
                let y = _.find(schema['@graph'], function (o) {
                    return o['@id'] == prop && o['@type'] == 'rdf:Property';
                });
                if (typeof  y === 'undefined') {
                    throw `Property name ${prop} is not recognized by the schema`;
                }
            }
            if (typeof obj[prop] === 'object') {
                validateWithSchema(obj[prop]);
            }
        }
    }
};
// check if every key is in schema
const processValidation = function (expanded) {
    konsole('processValidation triggered');

    return new Promise(function (resolve, reject) {


        validateWithSchema(expanded);

        //if(isValid === false){
        //   return reject('no valid against schema');
        // }


        validateWebComponent(expanded).then(function () {
            if (expanded[0]['@type'][0] === myVocab + 'ServiceDescription') {
                konsole('processValidation: success');
                resolve(expanded);
            } else {
                konsole('processValidation: failure');
                reject('invalid');
            }
        }).catch(function (error) {
            konsole('CAT ERROR: ' + error);
            reject(error);
        });


    });


};


const serviceValidatorRequest = function (req, res, next) {
    let contentTypes = ['application/json', 'application/ld+json'];
    if (_.indexOf(contentTypes, req.header('content-type')) < 0) {
        return res.status(415).json({'error': true, 'message': 'Invalid content-type. Supported: application/json, application/ld+json'});
    }

    // check for matching @context url
    let contextsConf = req.app.get('appConfig').get('contexts');
    let serviceContext;
    if (typeof contextsConf !== "undefined" && contextsConf['serviceconf']) {
        serviceContext = contextsConf['serviceconf'];
    }

    let reqContext = req.body['@context'];
    if (_.isString(reqContext)) {
        if (reqContext !== serviceContext) {
            return res.status(429).json({'error': true, 'message': 'Invalid @context in the request'});
        }
        else {
            req.body['@context'] = context;
        }
    }


    var expand = jsonldPromises.expand(req.body);

    var flatt = jsonldPromises.flatten(req.body);




    expand.then(processValidation).then(function (expanded) {

        res.locals.jsonldexpanded = expanded;
        konsole('FINAL: ' + JSON.stringify(res.locals.jsonldexpanded));
        flatt.then(function (flatten) {


            let z = _.find(flatten, function (o) {
                return _.isEqual(_.toString(o['@type']), myVocab + "WebServer");
            });
            konsole(JSON.stringify(flatten));
            if (_.isObject(z) && z[myVocab + "hostname"] && z[myVocab + "hostname"][0] && z[myVocab + "hostname"][0]['@value']) {
                req.inputhostname = z[myVocab + "hostname"][0]['@value'];
            }

            res.locals.jsonflatten = flatten;
            let cflattcompact = jsonldPromises.compact(flatten, req.body['@context'] );

            cflattcompact.then(function(result){
                res.locals.jsoncompactflatten = result;
                next();
            });



        });

    }).catch(function (error) {
        konsole('Error catch: ' + error);
        return res.status(422).json({'error': true, 'message': 'Invalid request : ' + error});
    });


    // return res.status(400).json({'error': true, 'message': 'Invalid json'});


};


module.exports.serviceValidatorRequest = serviceValidatorRequest;