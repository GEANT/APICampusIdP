'use strict';
const _ = require('lodash');
const forge = require("node-forge");
const pki = forge.pki;
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
const errPrefix= "323";
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


const validateKeyDescriptor = function (obj) {

    if (obj.hasOwnProperty(myVocab + 'use')) {
        if (obj['' + myVocab + 'use'][0] === undefined || obj['' + myVocab + 'use'][0]['@value'] === undefined) {
            return false;
        }
        if (obj['' + myVocab + 'use'][0]['@value'] !== 'signing' && obj['' + myVocab + 'use'][0]['@value'] !== 'encryption') {
            console.log('KeyDescriptor has incorect :use: ' + obj['' + myVocab + 'use'][0]['@value']);
            return false;
        }
    }

    if (obj.hasOwnProperty(myVocab + 'publicKey') !== true || obj.hasOwnProperty(myVocab + 'privateKey' !== true)) {
        console.log('missing privateKey or/and publicKey');
        return false;
    }

    //  let publicKey = obj.hasOwnProperty[myVocab + 'publicKey'][0]['@value'];
    let publicKey = _.get(obj, [myVocab + 'publicKey', 0, '@value']);
    let privateKey = _.get(obj, [myVocab + 'privateKey', 0, '@value']);

    if (typeof publicKey === 'undefined' || typeof privateKey === 'undefined') {
        return false;
    }
    let pkiPubKey = pki.certificateFromPem(publicKey);
    let pkiPrivKey = pki.privateKeyFromPem(privateKey);

    /**
     * @todo validate if private key matches public
     */


    return true;

};

const processMetadataProvider = function (component) {
    if (checkForType(component, myVocab + 'MetadataProvider') !== true) {
        throw "One of the nodes in metadataProviders is not MetadataProvider @type";
    }
    if (component.hasOwnProperty(myVocab + 'url') !== true) {
        throw "Missing url property in MetadataProvider @type node";
    }
    let urlString = _.get(component, [myVocab + 'url', '0', '@value']);
    if (validator.isURL(urlString) !== true) {
        throw "MetadataProvider @type node contains invalid value for url property";
    }
    if (component.hasOwnProperty(myVocab + 'publicKey') === true) {
        if (checkForType(component[myVocab + 'publicKey'][0], '' + myVocab + 'X509Certificate') !== true) {
            throw "The publicKey property in MetadataProvider @type must contain node of X509Certificate @type";
        }
        let tmpPublicKey = _.get(component[myVocab + 'publicKey'][0],['@value']);
        try {
            pki.certificateFromPem(tmpPublicKey);
        } catch (e) {
            throw "The publicKey property in MetadataProvider : "+e;
        }
    }
    if (component.hasOwnProperty(myVocab+'attrID') !== true){
        throw "Missing attrID property in MetataProvider @type node";
    }

};

const processMetadataProviders = function (component) {

    let compLen = component.length;
    for (let i = 0; i < compLen; i++) {
        if (component.hasOwnProperty(i)) {
            processMetadataProvider(component[i]);
        }
    }
};


// check if every key is in schema
const processValidation = function (req, res, next) {
    konsole('processValidation triggered');
    return new Promise((resolve, reject) => {

        let expanded = res.locals.expandedInput;


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
            res.locals.entityID = entityID['@value'];
            if (idpComponent[0].hasOwnProperty(myVocab + 'metadataProviders') !== true) {
                return reject('missing metadataProviders property');
            }

            processMetadataProviders(idpComponent[0][myVocab + 'metadataProviders']);


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
                certsign['@type'] = ['' + myVocab + 'KeyDescriptor'];

                certsign['' + myVocab + 'publicKey'].push({
                    '@type': myVocab + 'X509Certificate',
                    '@value': eol.auto(ssogen.signing.certificate),
                });

                certsign['' + myVocab + 'privateKey'].push({
                    '@value': eol.auto(ssogen.signing.privateKey)
                });

                certsign['' + myVocab + 'use'].push({
                    '@value': 'signing'
                });

                idpComponent[0]['' + myVocab + 'sso'][0]['' + myVocab + 'certificates'].push(certsign);

                let certenc = {};
                certenc['' + myVocab + 'publicKey'] = [];
                certenc['' + myVocab + 'privateKey'] = [];
                certenc['' + myVocab + 'use'] = [];
                certenc['@type'] = ['' + myVocab + 'KeyDescriptor'];
                certenc['' + myVocab + 'publicKey'].push({
                    '@type': myVocab + 'X509Certificate',
                    '@value': eol.auto(ssogen.encryption.certificate),
                });
                certenc['' + myVocab + 'privateKey'].push({
                    '@value': eol.auto(ssogen.encryption.privateKey)
                });

                certenc['' + myVocab + 'use'].push({
                    '@value': 'encryption'
                });
                idpComponent[0]['' + myVocab + 'sso'][0][myVocab + 'certificates'].push(certenc);
                delete idpComponent[0]['' + myVocab + 'sso'][0]['@type'];

            }
            else {

                if (idpComponent[0]['' + myVocab + 'sso'][0].hasOwnProperty(myVocab + 'certificates') !== true) {
                    return reject('missing ceritificates property in sso component');
                }
                let ssoCerts = idpComponent[0]['' + myVocab + 'sso'][0][myVocab + 'certificates'];

                if (checkForType(ssoCerts[0], myVocab + 'autoGenerated') === true) {
                    return reject('ceritificates property is not allowed to be autoGenerate. Use "autoGenerated in soo');
                }

                for (let i = 0; i < ssoCerts.length; i++) {
                    let certObj = ssoCerts[i];
                    if (checkForType(certObj, myVocab + 'KeyDescriptor') !== true) {
                        return reject('ceritificate must be KeyDescriptor type');
                    }
                    if (validateKeyDescriptor(certObj) !== true) {
                        return reject('Invalid certificate');
                    }


                }
                //console.log(idpComponent[0]['' + myVocab + 'sso'][0][myVocab + 'certificates'].length);

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

    expand.then((expresolve) => {
        res.locals.expandedInput = expresolve;

    }).then(() => {
        return processValidation(req, res, next)
    }).then(() => {
        const flatt = jsonldPromises.flatten(res.locals.expandedInput);
        res.locals.srvConfExpand = res.locals.expandedInput;

        flatt.then((flatten) => {


            let z = _.find(flatten, function (o) {
                return _.isEqual(_.toString(o['@type']), myVocab + "WebServer");
            });

            if (_.isObject(z) && z[myVocab + "hostname"] && z[myVocab + "hostname"][0] && z[myVocab + "hostname"][0]['@value']) {
                req.inputhostname = z[myVocab + "hostname"][0]['@value'];
            }


            res.locals.srvConfFlat = flatten;
            const cflatcompact = jsonldPromises.compact(flatten, req.body['@context']);

            cflatcompact.then(function (result) {
                res.locals.srvConfFlatCompact = result;
                next();
            });


        });

    }).catch(function (error) {
        konsole('Error catch: ' + error);
        return res.status(400).json({'error': true, 'message': 'Invalid request : ' + error});
    });


    // return res.status(400).json({'error': true, 'message': 'Invalid json'});


};


module.exports.serviceValidatorRequest = serviceValidatorRequest;
