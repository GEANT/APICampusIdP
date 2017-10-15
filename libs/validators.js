const _ = require('lodash');
var jsonld = require('jsonld');
var jsonldPromises = jsonld.promises;

var vocab = require('./apiVocab').context;
var schema = require('./apiVocab').schema;

var context = vocab;
var myVocab = context['@vocab'];


var genKeyWithPref = function (key) {
    return myVocab + key;
};

var validateWebComponent = function (expand) {
    console.log('validateWebComponent: triggered');
    return new Promise(function (resolve, reject) {

        resolve(expand);


        console.log('FG: ' + expand[genKeyWithPref('components')]);
        if (expand[genKeyWithPref('components')] !== undefined && expand[genKeyWithPref('components')][genKeyWithPref('web')]) {
            var myNode = expand[genKeyWithPref('components')][genKeyWithPref('web')];
            console.log('FF: ' + JSON.stringify(myNode));
            resolve(expand);
        }
        else {
            console.log('validateWebComponent : failure');
            reject('components are invalid');
        }


        //https://geant.org/campusidp/web
    });
};

var validateWithSchema = function (obj) {

    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // console.log(` property name = ${Object.keys(obj)}`);
            //  console.log(`obj.${prop} = ${obj[prop]}`);
            if (prop === '@type') {
                //   console.log(`@type is ${obj[prop]}`);
                let z = _.find(schema['@graph'], function (o) {
                    return o['@id'] == obj[prop] && o['@type'] == 'rdfs:Class';
                });
                //   console.log(`dd ::: ${z} for ${obj[prop]}`);
                if (typeof  z === 'undefined') {
                    throw `@type  : ${obj[prop]}  is not recognized by the schema`;
                }
            }
            else if (!prop.startsWith('@') && isNaN(prop)) {
                // console.log(`Property name found: ${prop}`);
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
var processValidation = function (expanded) {
    console.log('processValidation triggered');

    return new Promise(function (resolve, reject) {


        validateWithSchema(expanded);

        //if(isValid === false){
        //   return reject('no valid against schema');
        // }


        validateWebComponent(expanded).then(function () {
            if (expanded[0]['@type'][0] === myVocab + 'ServiceDescription') {
                console.log('processValidation: success');
                resolve(expanded);
            } else {
                console.log('processValidation: failure');
                reject('invalid');
            }
        }).catch(function (error) {
            console.log('CAT ERROR: ' + error);
            reject(error);
        });


    });


};


var serviceValidatorRequest = function (req, res, next) {
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
            return res.status(400).json({'error': true, 'message': 'Invalid @context in the request'});
        }
        else {
            req.body['@context'] = context;
        }
    }


    var expand = jsonldPromises.expand(req.body);

    var flatt = jsonldPromises.flatten(req.body);




    expand.then(processValidation).then(function (expanded) {

        req.jsonldexpanded = expanded;
        console.log('FINAL: ' + JSON.stringify(req.jsonldexpanded));
        flatt.then(function (flatten) {


            let z = _.find(flatten, function (o) {
                return _.isEqual(_.toString(o['@type']), myVocab + "WebServer");
            });
            console.log(JSON.stringify(flatten));
            if (_.isObject(z) && z[myVocab + "hostname"] && z[myVocab + "hostname"][0] && z[myVocab + "hostname"][0]['@value']) {
                req.inputhostname = z[myVocab + "hostname"][0]['@value'];
            }

            req.jsonflatten = flatten;
            let cflattcompact = jsonldPromises.compact(flatten, req.body['@context'] );

            cflattcompact.then(function(result){
                req.jsoncompactflatten = result;
                next();
            });



        });

    }).catch(function (error) {
        console.log('Error catch: ' + error);
        return res.status(400).json({'error': true, 'message': 'Invalid request : ' + error});
    });


    // return res.status(400).json({'error': true, 'message': 'Invalid json'});


};


module.exports.serviceValidatorRequest = serviceValidatorRequest;