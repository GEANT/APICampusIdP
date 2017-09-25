const _ = require('lodash');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;

const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;

const context = vocab;
const myVocab = context['@vocab'];

var getGraph = function (input) {


    /*
    @todo finish to find "@graph" property in deep nested json
     */
};

var hideSensitive = function (inputGraph) {
    /*
    @todo filter out sensitive information like passwords, private keys and so on...
     */
    if (inputGraph.configuration && inputGraph.configuration.data && inputGraph.configuration.data['@graph']) {
        console.log(`>>>>>>>> @graph FOUND`);
    }
    else {
        console.log(`>>>>>>>> @graph NOT FOUND`);
    }

    return inputGraph;
};


module.exports.hideSensitive = hideSensitive;