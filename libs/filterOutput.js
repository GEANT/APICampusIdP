const _ = require('lodash');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;
const konsole = require('./konsole');
const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;

const context = vocab;
const myVocab = context['@vocab'];
const errPrefix= "318";
var getGraph = function (input) {


    /*
    @todo finish to find "@graph" property in deep nested json
     */


};

var traversalWalk = function (input) {


};

var hideSensitive = function (inputData) {

    /**
     * @todo make this independent from the structure
     */
    let graphNode = _.get(inputData,['configs','0','flatcompact','@graph']);
    if (typeof graphNode === 'object') {

        //console.log(`>>>>>>>> @graph FOUND`);
       _.find(graphNode, function (o) {
            if(o.hasOwnProperty('privateKey')  && _.isString(o.privateKey)) {
                o.privateKey = { "@type": "hidden"};
            //    console.log(`object for private key:   ${JSON.stringify(o)}`);
            }
            if (o.hasOwnProperty('privateKeyPassword') && _.isString(o.privateKeyPassword)){
                o.privateKeyPassword = { "@type": "hidden"};
            //    console.log(`object for privateKeyPassword:   ${JSON.stringify(o)}`);
            }
            if (o.hasOwnProperty('password') && _.isString(o.password)){
                o.password = { "@type": "hidden"};
            //    console.log(`object for password:   ${JSON.stringify(o)}`);
            }
        });

    }
    else {
        //console.log(`>>>>>>>> @graph NOT FOUND`);
    }

    return inputData;
};


module.exports.hideSensitive = hideSensitive;