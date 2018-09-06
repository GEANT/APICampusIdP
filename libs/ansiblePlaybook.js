'use strict';
const _ = require('lodash');
const fs = require('fs');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;
const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;
const konsole = require('./konsole');
const forge = require("node-forge");
const pki = forge.pki;
const context = vocab;
const myVocab = context['@vocab'];
const yaml = require('write-yaml');
const writeData = require('write-data');
const json2yaml = require('json2yaml');
const eol = require('eol');
const errPrefix= "313";
//const ansibleTemplateFile = fs.open('../etc/an.yml');


const genEntityID = function (input, playbook) {
    let entity =  _.get(input, ['@graph','0', 'components','idp','entityID']);
    playbook.idp_entityID = entity;

    return playbook;
};

const genOrgInfo = function (input, playbook){

    let res = _.get(input, ['@graph', '0', 'organization']);
    if(! playbook.hasOwnProperty('idp_metadata')){
        playbook.idp_metadata = {};
    }
    if(! playbook.idp_metadata.hasOwnProperty('en')){
        playbook.idp_metadata.en = {};
    }

    playbook.idp_metadata.en.org_name = res.name;
    playbook.idp_metadata.en.org_displayName = res.name;
    playbook.idp_metadata.en.org_url = res.url;
    playbook.idp_metadata.en.mdui_displayName =  res.name;
    playbook.idp_metadata.en.mdui_infoUrl = res.url;
    playbook.idp_metadata.en.mdui_logo = res.logo;
    return playbook;
};

const getIdpMetadata = function (input , playbook){
    /**
     * @todo finish
     */
};

const genMetadataProviders = function (input, playbook) {

    let metaProviders = _.get(input, ['@graph', '0', 'components', 'idp', 'metadataProviders']);
    if (typeof metaProviders === 'undefined') {
        throw 'Metadata not found in the config';
    }

    let metaProvidersList = [];

    if (metaProviders.constructor.name === 'Object') {
        metaProvidersList.push(metaProviders);
    }
    else {
        metaProvidersList = metaProviders;
    }



    playbook.idp_metadata_providers = [];

    for (let i = 0; i < metaProvidersList.length; i++) {
        let meta = {};
        meta.id = metaProvidersList[i].attrID;
        meta.url = metaProvidersList[i].url;
        meta.file = 'metaprovider-' + metaProvidersList[i].attrID + '.xml';
        meta.maxValidInterval = 'P5D';
        meta.disregardTLSCertificate = "false";
        let ct = eol.crlf(_.get(metaProvidersList, [i, 'publicKey', '@value']));
        if (typeof ct !== 'undefined') {

            try {
                let forgeCert = pki.certificateFromPem(ct);

                meta.pubKey = eol.lf(pki.publicKeyToPem(forgeCert.publicKey));
            } catch (e) {
                console.log('EERR ' + e);
            }

        }

        playbook.idp_metadata_providers.push(meta);

    }
    return playbook;
};

const genFqdn = function (input, playbook){
    let res = _.get(input, ['@graph', '0', 'components', 'web']);
    if (typeof res === 'undefined') {
        throw 'fqdn not found';
    }
    if(res['@type'] !== 'WebServer'){
        throw 'fqdn not found (incorrect node type';
    }
    if(typeof res.hostname === 'undefined'){
        throw 'fqdn not found (missing hostname attr)';
    }
    playbook.fqdn = res.hostname;
    return playbook;
}

const genContacts = function (input, playbook) {
    let contacts = _.get(input, ['@graph', '0', 'organization', 'contacts']);
    if (typeof contacts === 'undefined') {
        throw 'Contacts not found in the config';
    }
    console.log(Array.isArray(contacts));
    console.log(contacts.length);
    if(Array.isArray(contacts)) {
        if(contacts.length === 0){
            throw 'Contacts not found in the config';
        }
        for (let i = 0; i < contacts.length; i++) {
            let contactType = contacts[i].contactType;

            console.log(contactType);
            let cnt = {
                email: contacts[i].email,
                givenName: contacts[i].name
            };
            playbook.idp_contacts[contactType] = cnt;
        }
    }
    else {
        let contactType = contacts.contactType;

        if(typeof contactType === 'undefined'){
            throw 'Contacts not found in the config';
        }
        let cnt = {
            email: contacts.email,
            givenName: contacts.name
        };
        playbook.idp_contacts[contactType] = cnt;
    }
    return playbook;
};


const genPlaybook = function (input, version = null) {


    let playbook = {
        idp_config: {},
        idp_metadata_providers: {},
        idp_contacts: {}

    };


    return new Promise((resolve, reject) => {
        let frame = {
            "@context": vocab,
          "@type": myVocab + "ServiceDescription"
        };
        const framed = jsonldPromises.frame(input, frame);
        framed.then((result) => {
            genFqdn(result,playbook);
            genOrgInfo(result,playbook);
            genMetadataProviders(result, playbook);
            genContacts(result,playbook);
            genEntityID(result,playbook);

            let yamlst = json2yaml.stringify(playbook);
            resolve(yamlst);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.genPlaybook = genPlaybook;


