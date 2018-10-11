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

    let tmpResName = [];

    if (Array.isArray(res.name)) {
        tmpResName = res.name;
    }
    else {
        tmpResName.push(res.name);
    }
    for (let i = 0; i < tmpResName.length; i++) {
        let tmpName = tmpResName[i];
        if (tmpName.hasOwnProperty('@value')) {
            if (tmpName.hasOwnProperty('@language')) {
                let nlang = tmpName['@language'];
                if (!playbook.idp.md.hasOwnProperty(nlang)) {
                    playbook.idp.md[nlang] = {};
                }
                playbook.idp.md[nlang].org_name = tmpName['@value'];
                playbook.idp.md[nlang].org_displayname = tmpName['@value'];
                playbook.idp.md[nlang].mdui_displayname = tmpName['@value'];
            } else {
                playbook.idp.md.en.org_name = tmpName['@value'];
                playbook.idp.md.en.org_displayName = tmpName['@value'];
                playbook.idp.md.en.mdui_displayName = tmpName['@value'];
            }
        }
        else {
            playbook.idp.md.en.org_name = tmpName;
            playbook.idp.md.en.org_displayName = tmpName;
            playbook.idp.md.en.mdui_displayName = tmpName;
        }
    }


//    playbook.idp.md.en.mdui_logo = res.logo;
    if (typeof res.logo !== "undefined") {
        getLogo(res, playbook);
    }
    return playbook;

};

const genFavicon = function (input, playbook) {
    let favicon = _.get(input, ['@graph', '0', 'components', 'web', 'favicon']);
    if (typeof favicon === "undefined") {
        return playbook;
    }
    if (playbook.idp.hasOwnProperty('md') !== true) {
        playbook.idp.md = {};
    }
    if (playbook.idp.md.hasOwnProperty('en') !== true) {
        playbook.idp.md.en = {};
    }
    for (let key in playbook.idp.md) {
        if (playbook.idp.md.hasOwnProperty(key)) {
            playbook.idp.md[key].mdui_favicon = favicon;
        }
    }
    //playbook.idp.favicon = favicon;
    return playbook;

};

const getLogo = function (res, playbook) {
    let tmpLogoName = [];

    if (Array.isArray(res.logo)) {
        tmpLogoName = res.logo;
    }
    else {
        if (typeof res.logo !== 'undefined') {
            tmpLogoName.push(res.logo);
        }
    }
    for (let i = 0; i < tmpLogoName.length; i++) {
        let tmpName = tmpLogoName[i];
        if (tmpName.hasOwnProperty('@value')) {
            if (tmpName.hasOwnProperty('@language')) {
                let nlang = tmpName['@language'];
                if (!playbook.idp.md.hasOwnProperty(nlang)) {
                    playbook.idp.md[nlang] = {};
                }
                playbook.idp.md[nlang].mdui_logo = tmpName['@value'];
            } else {
                playbook.idp.md.en.mdui_logo = tmpName['@value'];
            }
        }
        else {
            playbook.idp.md.en.mdui_logo = tmpName;
        }
    }

    playbook.idp.md.en.org_url = res.url;
    playbook.idp.md.en.mdui_infoUrl = res.url;

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
        if (scopesMeta.length === 0) {
            return playbook;
        }
        if (!playbook.idp.hasOwnProperty('scope')) {
            playbook.idp.scope = [];
        }
        for (let i = 0; i < scopesMeta.length; i++) {
            playbook.idp.scope.push(scopesMeta[i]);
        }
    } else {
        if (!playbook.idp.hasOwnProperty('scope')) {
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
                meta.pubKey = eol.auto(ct.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----','').trim());
                meta.pubKey.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----','');
            } catch (e) {
                console.log('EERR ' + e);
            }

        }

        playbook.idp.metadata_providers.push(meta);

    }
    return playbook;
};

const genSystem = function (input, playbook) {
    if (!playbook.hasOwnProperty('sys')) {
        playbook.sys = {};
    }
    playbook.sys.swap = '2048';
    /*playbook.sys.ntp1 = 'ntp1.inrim.it';
    playbook.sys.ntp2 = 'ntp2.inrim.it';
    playbook.sys.ntp3 = '0.it.pool.ntp.org';*/

    /**
     * @todo overwrite if provided
     */

    let timez = _.get(input, ['@graph', '0', 'components', 'web', 'timezone']);
    if (typeof timez !== "undefined") {
        playbook.sys.my_timezone = timez;
    }
    return playbook;


};


const genWeb = function (input, playbook) {
    // set default first
    if (!playbook.hasOwnProperty('web')) {
        playbook.web = {};
    }
    if (!playbook.web.hasOwnProperty('footer_text_color')) {
        playbook.web.footer_text_color = '#ffffff';
    }
    if (!playbook.web.hasOwnProperty('footer_background_color')) {
        playbook.web.footer_background_color = '#39d024';
    }

    /**
     * @todo overwrite default
     */

    return playbook;
};

const genSSOKeys = function (input, playbook) {


    let res = _.get(input, ['@graph', '0', 'components', 'idp', 'sso', 'certificates']);
    if (typeof res === 'undefined') {
        throw 'sso keys not found';
    }
    if (Array.isArray(res)) {

        if (res.length === 0) {
            throw 'sso keys not found';
        }
        if (!playbook.idp.hasOwnProperty('sso_keys')) {
            playbook.idp.sso_keys = [];
        }
        for (let i = 0; i < res.length; i++) {
            let nKey = {};
            if (res[i].hasOwnProperty('use')) {
                if (res[i].use === 'signing') {
                    nKey.use = 'sign';
                }
                else {
                    nKey.use = 'enc';
                }
            }
            nKey.privKey = res[i].privateKey;
            nKey.pubKey = res[i].publicKey['@value'];
            if (res[i].hasOwnProperty('password')) {
                nKey.password = res[i].password;
            }

            playbook.idp.sso_keys.push(nKey);
        }
    } else {
        if (!playbook.idp.hasOwnProperty('sso_keys')) {
            playbook.idp.sso_keys = [];
        }
        let nKey = {};
        if (res.hasOwnProperty('use')) {
            if (res.use === 'signing') {
                nKey.use = 'sign';
            }
            else {
                nKey.use = 'enc';
            }
        }
        nKey.privKey = res.privateKey;
        nKey.pubKey = res.publicKey['@value'];
        if (res.hasOwnProperty('password')) {
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

    if (typeof  res.logo !== "undefined" && res.logo !== '') {
        console.log('logo found');

        getLogo(res, playbook);
    }
    else {
        console.log('logo found');
    }

    return playbook;
};

const genContacts = function (input, playbook) {
    let contacts = _.get(input, ['@graph', '0', 'organization', 'contacts']);
    if (typeof contacts === 'undefined') {
        throw 'Contacts not found in the config';
    }
    if (Array.isArray(contacts)) {
        if (contacts.length === 0) {
            throw 'Contacts not found in the config';
        }
        for (let i = 0; i < contacts.length; i++) {
            let contactType = contacts[i].contactType;
            if (!playbook.contacts.hasOwnProperty(contactType)) {
                playbook.contacts[contactType] = [];
            }
            let cnt = {
                email: contacts[i].email,
                name: contacts[i].name
            };
            if(cnt.email && cnt.name) {
                playbook.contacts[contactType].push(cnt);
            }
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

const genEntityCategories = function (input, playbook) {
    let categories = _.get(input, ['@graph', '0', 'components', 'idp', 'entityCategories']);
    if (typeof categories === "object") {
        if (categories.hasOwnProperty('coco') && categories.coco === true) {
            playbook.idp.sup_coco = 'yes';
        }
        if (categories.hasOwnProperty('research-and-scholarship') && categories["research-and-scholarship"] === true) {
            playbook.idp.sup_rs = 'yes';
        }
    }
    return playbook;
};

const getTimeZone = function (input, playbook) {

};

const genPlaybook = function (input, version = null) {


    let playbook = {
        fqdn: null,
        idp: {
            sup_rs: 'no',
            sup_coco: 'no',
            md: {
                en: {}
            },
            metadata_providers: {}
        },
        contacts: {},
        web: {},
        sys: {
            my_timezone: 'utc'
        }

    };


    return new Promise((resolve, reject) => {
        let frame = {
            "@context": vocab,
            "@type": myVocab + "ServiceDescription"
        };
        const framed = jsonldPromises.frame(input, frame);
        framed.then((result) => {
            genOrgInfo(result, playbook);
            genFqdn(result, playbook);
            genMetadataProviders(result, playbook);
            getSSOScopes(result, playbook);
            genContacts(result, playbook);
            genEntityID(result, playbook);
            genEntityCategories(result, playbook);
            genSSOKeys(result, playbook);
            genWeb(result, playbook);
            genSystem(result, playbook);
            genFavicon(result, playbook);

            let yamlst = json2yaml.stringify(playbook);
            resolve(yamlst);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.genPlaybook = genPlaybook;


