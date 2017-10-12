var file = require('fs');
var nconf = require('nconf');
function Config(){

    nconf.argv().env("_");
    var environment = nconf.get("NODE:ENV") || "development";
    console.log('NODE:ENV set to: '+environment);
    nconf.file(environment,__dirname+"/../../etc/"+environment+".json");
    nconf.file("default", __dirname+"/../../etc/default.json");

}

Config.prototype.get = function (key) {
   return nconf.get(key);
};

module.exports = new Config();