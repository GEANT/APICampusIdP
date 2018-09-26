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
const errPrefix = "313";
//const ansibleTemplateFile = fs.open('../etc/an.yml');


const genEntityID = function (input, playbook) {
    let entity = _.get(input, ['@graph', '0', 'components', 'idp', 'entityID']);
    playbook.idp.entityID = entity;

    return playbook;
};

const genOrgInfo = function (input, playbook) {

    let res = _.get(input, ['@graph', '0', 'organization']);

    if (!playbook.idp.md.hasOwnProperty('en')) {
        playbook.idp.md.en = {};
    }

    playbook.idp.md.en.org_name = res.name;
    playbook.idp.md.en.org_displayName = res.name;
    playbook.idp.md.en.org_url = res.url;
    playbook.idp.md.en.mdui_displayName = res.name;
    playbook.idp.md.en.mdui_infoUrl = res.url;
    playbook.idp.md.en.mdui_logo = res.logo;
    return playbook;
};

const getIdpMetadata = function (input, playbook) {
    /**
     * @todo finish
     */
};

const getSSOScopes = function (input, playbook) {
    let scopesMeta = _.get(input, ['@graph', '0', 'components', 'idp', 'sso', 'scopes']);
    if (typeof scopesMeta === 'undefined') {
        return playbook;
    }
    if (Array.isArray(scopesMeta)) {
        if(scopesMeta.length === 0){
            return playbook;
        }
        if(!playbook.idp.hasOwnProperty('scope')){
            playbook.idp.scope = [];
        }
        for (let i = 0; i < scopesMeta.length; i++) {
            playbook.idp.scope.push(scopesMeta[i]);
        }
    }else{
        if(!playbook.idp.hasOwnProperty('scope')){
            playbook.idp.scope = [];
        }
        playbook.idp.scope.push(scopesMeta);
    }


    return playbook;

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


    playbook.idp.metadata_providers = [];

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

        playbook.idp.metadata_providers.push(meta);

    }
    return playbook;
};

const genSystem = function(input, playbook){
  if(!playbook.hasOwnProperty('sys')){
      playbook.sys = {};
  }
  playbook.sys.swap = '2';
  playbook.sys.my_timezone = 'Europe/Rome';
  playbook.sys.ntp1 = 'ntp1.inrim.it';
  playbook.sys.ntp2 = 'ntp2.inrim.it';
  playbook.sys.ntp3 = '0.it.pool.ntp.org';

    /**
     * @todo overwrite if provided
     */

  return playbook;


};


const genWeb = function(input, playbook){
  // set default first
    if(!playbook.hasOwnProperty('web')){
        playbook.web = {};
    }
    if(!playbook.web.hasOwnProperty('footer_text_color')){
        playbook.web.footer_text_color = '#ffffff';
    }
    if(!playbook.web.hasOwnProperty('footer_background_color')){
        playbook.web.footer_background_color = '#39d024';
    }

    /**
     * @todo overwrite default
     */

    return playbook;
};

const genSSOKeys = function(input, playbook){


    let res = _.get(input, ['@graph', '0', 'components', 'idp','sso', 'certificates']);
    if (typeof res === 'undefined') {
        throw 'sso keys not found';
    }
    if (Array.isArray(res)) {

        if(res.length === 0){
            throw 'sso keys not found';
        }
        if(!playbook.idp.hasOwnProperty('sso_keys')){
            playbook.idp.sso_keys = [];
        }
        for (let i = 0; i < res.length; i++) {
            let nKey = {};
            if(res[i].hasOwnProperty('use')){
                if(res[i].use === 'signing'){
                    nKey.use = 'sign';
                }
                else {
                    nKey.use = 'enc';
                }
            }
            nKey.privKey = res[i].privateKey;
            nKey.pubKey = res[i].publicKey;
            if(res[i].hasOwnProperty('password')){
                nKey.password = res[i].password;
            }

            playbook.idp.sso_keys.push(nKey);
        }
    }else{
        if(!playbook.idp.hasOwnProperty('sso_keys')){
            playbook.idp.sso_keys = [];
        }
        let nKey = {};
        if(res.hasOwnProperty('use')){
            if(res.use === 'signing'){
                nKey.use = 'sign';
            }
            else {
                nKey.use = 'enc';
            }
        }
        nKey.privKey = res.privateKey;
        nKey.pubKey = res.publicKey;
        if(res.hasOwnProperty('password')){
            nKey.password = res.password;
        }

        playbook.idp.sso_keys.push(nKey);
    }

    return playbook;
};

const genFqdn = function (input, playbook) {
    let res = _.get(input, ['@graph', '0', 'components', 'web']);
    if (typeof res === 'undefined') {
        throw 'fqdn not found';
    }
    if (res['@type'] !== 'WebServer') {
        throw 'fqdn not found (incorrect node type';
    }
    if (typeof res.hostname === 'undefined') {
        throw 'fqdn not found (missing hostname attr)';
    }
    playbook.fqdn = res.hostname;
    return playbook;
};

const genContacts = function (input, playbook) {
    let contacts = _.get(input, ['@graph', '0', 'organization', 'contacts']);
    if (typeof contacts === 'undefined') {
        throw 'Contacts not found in the config';
    }
    console.log(Array.isArray(contacts));
    console.log(contacts.length);
    if (Array.isArray(contacts)) {
        if (contacts.length === 0) {
            throw 'Contacts not found in the config';
        }
        for (let i = 0; i < contacts.length; i++) {
            let contactType = contacts[i].contactType;
            if (!playbook.contacts.hasOwnProperty(contactType)) {
                playbook.contacts[contactType] = [];
            }

            console.log(contactType);
            let cnt = {
                email: contacts[i].email,
                name: contacts[i].name
            };
            playbook.contacts[contactType].push(cnt);
        }
    }
    else {
        let contactType = contacts.contactType;

        if (typeof contactType === 'undefined') {
            throw 'Contacts not found in the config';
        }
        let cnt = {
            email: contacts.email,
            name: contacts.name
        };
        playbook.contacts[contactType] = cnt;
    }
    return playbook;
};


const genPlaybook = function (input, version = null) {


    let playbook = {
        fqdn: null,
        idp: {
            sup_rs: 'no',
            sup_coco: 'no',
            md : {},
            metadata_providers: {}
        },
        contacts: {},
        web: {
            
        }

    };



    return new Promise((resolve, reject) => {
        let frame = {
            "@context": vocab,
            "@type": myVocab + "ServiceDescription"
        };
        const framed = jsonldPromises.frame(input, frame);
        framed.then((result) => {
            genFqdn(result, playbook);
            genOrgInfo(result, playbook);
            genMetadataProviders(result, playbook);
            getSSOScopes(result,playbook);
            genContacts(result, playbook);
            genEntityID(result, playbook);
            genSSOKeys(result,playbook);
            genWeb(result,playbook);
            genSystem(result,playbook);

            let yamlst = json2yaml.stringify(playbook);
            resolve(yamlst);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.genPlaybook = genPlaybook;


