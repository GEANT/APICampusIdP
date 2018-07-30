const file = require('fs');
const nconf = require('nconf');
const konsole = require('./konsole');
const errPrefix= "321";
function Config() {

    nconf.argv().env("_");
    const environment = nconf.get("NODE:ENV") || "development";
    konsole('NODE:ENV set to: ' + environment, true);
    nconf.file(environment, __dirname + "/../etc/" + environment + ".json");
    nconf.file("default", __dirname + "/../etc/default.json");


}

Config.prototype.get = function (key) {
    return nconf.get(key);
};

module.exports = new Config();