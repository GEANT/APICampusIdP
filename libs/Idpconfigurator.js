const konsole = require('./konsole');

const isPropertyArray = function isArray(obj) {
    return !!obj && obj.constructor === Array;
};


const mainCnfTypes = [
    'ServiceDescription',
    'MetadataProvider',
    'DataSource',
    'Certificate',
    'AttributeDefinition',
    'DataConnector'
];
// function to transform 'configs' to object where property names are '@id' from array of objects
const convertToById = function (c) {
    const cLen = c.length;
    let result = {};
    let id;
    for (let i = 0; i < cLen; i++) {
        id = c[i]['@id'];
        result['' + id + ''] = c[i];
    }
    return result;
};

function validateServiceDescription(b) {
    konsole(b.entityID);
    if (!b.entityID) {
        return false;
    }
    if (!b.idpsso) {
        konsole('missing idpsso');
        return false;
    }


    return true;
}
const validateConfigs = function(b) {


    var zLenght = b.length;
    var serviceDescripionSet = false;

    konsole('Number of elements in configs: ' + zLenght);
    var converted = convertToById(b);
    var objElement, objType;
    for (var i = 0; i < zLenght; i++) {
        konsole('...checking of element ' + i);
        objElement = b[i];
        objType = objElement['@type'];
        if (mainCnfTypes.indexOf(objType) > -1) {
            konsole('ZUPA @type is valid of object is "' + objType + '"');
        }
        else {
            konsole('ZUPA @type is INvalid of object is "' + objType + '"');
            return false;
        }
        if (objType === 'ServiceDescription') {
            konsole('...proceeding for ServiceDecription ::: ' + serviceDescripionSet);
            if (serviceDescripionSet === true) {
                konsole('ServiceDescription already set');
                return false;
            }
            serviceDescripionSet = true;
            if (!validateServiceDescription(objElement)) {
                konsole('Invalid property ServiceDescription');
                return false;
            }
        }
    }


    konsole('convertToById:: ' + JSON.stringify(converted));


    return true;

};

var validateIDPConf = function (a) {
    // check if @type of object is 'IdPConf'
    if (a['@type'] !== 'IdPConf') {
        return false;
    }
    // check apiVersion
    if (!a.apiVersion === '1') {
        konsole('apiVersion incorrect: ' + a.apiVersion + ' , expected 1');
        return false;
    }
    // check if property 'configs' exists and is array type
    if (!a.configs || !isPropertyArray(a.configs)) {
        konsole('missing \'configs\'');
        return false;
    }

    // proceed 'configs' validation
    if (!validateConfigs(a.configs)) {
        konsole('configs are invalid');
        return false;
    }
    else {
        konsole('\'configs\' is type of: ' + typeof a.configs + '; ' + a.configs.constructor + '; ' + a.constructor);
    }


    return true;
};

module.exports.validateIDPConf = validateIDPConf;

