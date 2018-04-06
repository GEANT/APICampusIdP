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

//const ansibleTemplateFile = fs.open('../etc/an.yml');


const genMetadataProviders = function(input, playbook){

   // console.log(JSON.stringify(input['@graph'][0]['components']['idp']['metadataProviders'],null,3));
    let metaProviders = _.get(input,['@graph','0','components','idp','metadataProviders']);
    console.log('DDD');
    console.log(JSON.stringify(metaProviders));
    console.log('DDD');
    if(typeof metaProviders === 'undefined'){
        throw 'Metadata not found in the config';
    }

    console.log(metaProviders.constructor.name);

    playbook.idp_metadata_providers = [];
    if(metaProviders.constructor.name === 'Object'){
        let meta = {};
        meta.id = metaProviders.attrID;
        meta.url = metaProviders.url;
        meta.file = 'metaprovider-'+metaProviders.attrID+'.xml';
        meta.maxValidInterval= 'P5D';
        meta.disregardTLSCertificate = "false";
        let ct = _.get(metaProviders,['publicKey','@value']);
        if(typeof ct !== 'undefined')
        {
            meta.pubKey = pki.certificateToPem(pki.certificateFromPem(ct));
        }


        playbook.idp_metadata_providers.push(meta);
    }
    else {

        for (let i = 0; i < metaProviders.length; i++) {
            let meta = {};
            meta.id = metaProviders[i].attrID;
            meta.url = metaProviders[i].url;
            meta.file = 'metaprovider-' + metaProviders[i].attrID + '.xml';
            meta.maxValidInterval = 'P5D';
            meta.disregardTLSCertificate = "false";
            let ct = pki.certificateFromPem(metaProviders[i].publicKey['@value']);
            meta.pubKey = pki.certificateToPem(ct);
            playbook.idp_metadata_providers.push(meta);

        }
    }
    return playbook;
};

const genContacts = function(input,playbook){

};


const genPlaybook = function (input, version = null) {


    let playbook = {
        idp_config: {},
        idp_metadata_providers: {},
        idp_contacts: {}
    };


    return new Promise((resolve,reject)=>{
        let frame = {
            "@context": vocab,
            "@type": myVocab + "ServiceDescription"
        };
        const framed = jsonldPromises.frame(input, frame);
        framed.then((result)=>{

            playbook = genMetadataProviders(result, playbook);

            let yamlst = json2yaml.stringify(playbook);
            resolve(yamlst);
        }).catch((err)=>{
            reject(err);
        });
    });
};

module.exports.genPlaybook = genPlaybook;


