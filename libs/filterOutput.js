const _ = require('lodash');
const jsonld = require('jsonld');
const jsonldPromises = jsonld.promises;

const vocab = require('./apiVocab').context;
const schema = require('./apiVocab').schema;

const context = vocab;
const myVocab = context['@vocab'];

var hideSensitive = function(inputGraph){

};


module.exports.hideSensitive = hideSensitive;