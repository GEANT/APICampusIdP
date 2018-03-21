'use strict';
const _ = require('lodash');
const url = require('url');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;
const mongoose = require('mongoose');
const Provider = require('../models/Provider');

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
let app;

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

const checkForType = function (element, expectedType) {
    if (element.hasOwnProperty('@type') !== true) {
        return false;
    }
    if (element['@type'].indexOf(expectedType) < 0) {
        return false;
    }
    return true;
};

const hasValue = function (el) {
    // @todo finish
};

const validateEntityID = function () {
    console.log('POLO: ' + app.locals.entityID);
};

// check if every key is in schema
const processValidation = function (expanded) {
    konsole('processValidation triggered');

    return new Promise((resolve, reject) => {


        validateWithSchema(expanded);
        validateWebComponent(expanded).then(function () {
            let z = checkForType(expanded[0], myVocab + 'ServiceDescription');
            if (checkForType(expanded[0], myVocab + 'ServiceDescription') !== true) {
                konsole('processValidation: failure');
                return reject('@type ServiceDescription not found');
            }
            if (expanded[0].hasOwnProperty(myVocab + 'components') !== true) {
                return reject('components element not found');
            }
            const components = expanded[0][myVocab + 'components'][0];

            console.log('PPPPPPPPPPPPPPPPPPPPPPP');
            console.log(JSON.stringify(expanded, null, 2));
            console.log('PPPPPPPPPPPPPPPPPPPPPPP');

            if (checkForType(components, myVocab + 'Collection') !== true) {
                return reject('components element must be Collection @type');
            }

            // web component

            if (components.hasOwnProperty(myVocab + 'web') !== true) {
                return reject('web component not found in components collection');
            }

            let hostname = _.get(expanded, ['0', '' + myVocab + 'components', '0', '' + myVocab + 'web', '0', '' + myVocab + 'hostname', '0', '@value']);
            if (typeof hostname === 'undefined') {
                return reject('missing hostname value');
            }
            hostname = _.trim(hostname);
            if (isValidDomain(hostname) !== true) {
                return reject('invalid hostname value');
            }
            
            // start walk through components
            // idp component

            if (components.hasOwnProperty(myVocab + 'idp') !== true) {
                return reject('idp component not found in components collection');
            }


            const idpComponent = components[myVocab + 'idp'];
            if (!(0 in idpComponent)) {
                return reject('idp component is empty');
            }
            if (checkForType(idpComponent[0], myVocab + 'IdPConf') !== true) {
                return reject('idp component must be IdPConf @type');
            }
            if (idpComponent[0].hasOwnProperty(myVocab + 'entityID') !== true) {
                return reject('missing entityID property');
            }
            let entityID = idpComponent[0]['' + myVocab + 'entityID'][0];

            // generate entityID from hostname
            if (checkForType(entityID, myVocab + 'autoGenerated') === true) {
                entityID['@value'] = configGenHelper.genEntityID(hostname);
                delete entityID['@type'];
            }
            else {
                if (entityID['@value'] === undefined) {
                    return reject('missing entityID value');
                }
                entityID['@value'] = entityID['@value'].trim();
                if (entityID['@value'] === "") {
                    return reject('missing entityID value');
                }
            }
            app.locals.entityID = entityID['@value'];
            if (idpComponent[0].hasOwnProperty(myVocab + 'metadataProviders') !== true) {
                return reject('missing metadataProviders property');
            }
            /**
             * @todo finish metadataProviders
             */


            if (idpComponent[0].hasOwnProperty(myVocab + 'sso') !== true) {
                return reject('missing sso property');
            }


            let sso = idpComponent[0]['' + myVocab + 'sso'][0];
            if (typeof sso === undefined) {
                return reject('empty sso property');
            }


            // generate key - quite slow
            if (checkForType(sso, myVocab + 'autoGenerated') === true) {

                idpComponent[0]['' + myVocab + 'sso'][0]['' + myVocab + 'certificates'] = [];

                let ssogen = configGenHelper.genSso({hostname: hostname});
                let certsign = {};
                certsign['' + myVocab + 'publicKey'] = [];
                certsign['' + myVocab + 'privateKey'] = [];
                certsign['' + myVocab + 'use'] = [];

                certsign['' + myVocab + 'publicKey'].push({
                    '@type': myVocab + 'X509Certificate',
                    '@value': ssogen.signing.certificate,
                });

                certsign['' + myVocab + 'privateKey'].push({
                    '@value': ssogen.signing.privateKey
                });

                certsign['' + myVocab + 'use'].push({
                    '@value': 'signing'
                });

                idpComponent[0]['' + myVocab + 'sso'][0]['' + myVocab + 'certificates'].push(certsign);

                let certenc = {};
                certenc['' + myVocab + 'publicKey'] = [];
                certenc['' + myVocab + 'privateKey'] = [];
                certenc['' + myVocab + 'use'] = [];
                certenc['' + myVocab + 'publicKey'].push({
                    '@type': myVocab + 'X509Certificate',
                    '@value': ssogen.encryption.certificate,
                });
                certenc['' + myVocab + 'privateKey'].push({
                    '@value': ssogen.encryption.privateKey
                });

                certenc['' + myVocab + 'use'].push({
                    '@value': 'encryption'
                });
                idpComponent[0]['' + myVocab + 'sso'][0][myVocab + 'certificates'].push(certenc);

            }
            else {

            }


            // end walk through components


            konsole('processValidation: success');
            resolve(expanded);


        }).catch(function (error) {
            konsole('CAT ERROR: ' + error);
            reject(error);
        });


    });


};


const serviceValidatorRequest = function (req, res, next) {
    let contentTypes = ['application/json', 'application/ld+json'];
    if (_.indexOf(contentTypes, req.header('content-type')) < 0) {
        return res.status(415).json({
            'error': true,
            'message': 'Invalid content-type. Supported: application/json, application/ld+json'
        });
    }
    app = req.app;
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


    const expand = jsonldPromises.expand(req.body);


    expand.then(processValidation).then(function (expanded) {

        console.log('>>> AFTER PROCESSING START<<<');
        console.log(JSON.stringify(expanded, null, 2))
        console.log('>>> AFTER PROCESSING END<<<');
        const flatt = jsonldPromises.flatten(expanded);
        res.app.locals.srvConfExpand = expanded;

        flatt.then(function (flatten) {


            let z = _.find(flatten, function (o) {
                return _.isEqual(_.toString(o['@type']), myVocab + "WebServer");
            });

            if (_.isObject(z) && z[myVocab + "hostname"] && z[myVocab + "hostname"][0] && z[myVocab + "hostname"][0]['@value']) {
                req.inputhostname = z[myVocab + "hostname"][0]['@value'];
            }


            res.app.locals.srvConfFlat = flatten;
            const cflatcompact = jsonldPromises.compact(flatten, req.body['@context']);

            cflatcompact.then(function (result) {
                res.app.locals.srvConfFlatCompact = result;
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