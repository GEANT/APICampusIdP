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

const genContacts = function (input, playbook) {

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

            playbook = genMetadataProviders(result, playbook);

            let yamlst = json2yaml.stringify(playbook);
            resolve(yamlst);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.genPlaybook = genPlaybook;


