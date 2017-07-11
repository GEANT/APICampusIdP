var isPropertyArray = function isArray(obj) {
    return !!obj && obj.constructor === Array;
};


var mainCnfTypes = [
    'ServiceDescription',
    'MetadataProvider',
    'DataSource',
    'Certificate',
    'AttributeDefinition',
    'DataConnector'
];
// function to transform 'configs' to object where property names are '@id' from array of objects
var convertToById = function (c) {
    var cLen = c.length;
    var d = {};
    var id;
    for (var i = 0; i < cLen; i++) {
        id = c[i]['@id'];
        d['' + id + ''] = c[i];
    }
    return d;
}

function validateServiceDescription(b) {
    console.log(b.entityID);
    if (!b.entityID) {
        return false;
    }
    if (!b.idpsso) {
        console.log('missing idpsso');
        return false;
    }


    return true;
}
var validateConfigs = function(b) {


    var zLenght = b.length;
    var serviceDescripionSet = false;

    console.log('Number of elements in configs: ' + zLenght);
    var converted = convertToById(b);
    var objElement, objType;
    for (var i = 0; i < zLenght; i++) {
        console.log('...checking of element ' + i);
        objElement = b[i];
        objType = objElement['@type'];
        if (mainCnfTypes.indexOf(objType) > -1) {
            console.log('ZUPA @type is valid of object is "' + objType + '"');
        }
        else {
            console.log('ZUPA @type is INvalid of object is "' + objType + '"');
            return false;
        }
        if (objType === 'ServiceDescription') {
            console.log('...proceeding for ServiceDecription ::: ' + serviceDescripionSet);
            if (serviceDescripionSet === true) {
                console.log('ServiceDescription already set');
                return false;
            }
            serviceDescripionSet = true;
            if (!validateServiceDescription(objElement)) {
                console.log('Invalid property ServiceDescription');
                return false;
            }
        }
    }


    console.log('convertToById:: ' + JSON.stringify(converted));


    return true;

}

var validateIDPConf = function (a) {
    // check if @type of object is 'IdPConf'
    if (a['@type'] !== 'IdPConf') {
        return false;
    }
    // check apiVersion
    if (!a.apiVersion === '1') {
        console.log('apiVersion incorrect: ' + a.apiVersion + ' , expected 1');
        return false;
    }
    // check if property 'configs' exists and is array type
    if (!a.configs || !isPropertyArray(a.configs)) {
        console.log('missing \'configs\'');
        return false;
    }

    // proceed 'configs' validation
    if (!validateConfigs(a.configs)) {
        console.log('configs are invalid');
        return false;
    }
    else {
        console.log('\'configs\' is type of: ' + typeof a.configs + '; ' + a.configs.constructor + '; ' + a.constructor);
    }


    return true;
}

module.exports.validateIDPConf = validateIDPConf;

