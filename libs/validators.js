var _ = require('lodash');
var jsonld = require('jsonld');
var jsonldPromises = jsonld.promises;

var vocab = require('./apiVocab');
var context = vocab;



var processValidation = function(expanded){


    return new Promise(function(resolve,reject){
        var myVocab = context['@vocab'];
        console.log('myVocab: '+myVocab+'   --- '+JSON.stringify(expanded[0]['@type']));

        if(expanded[0]['@type'][0] === myVocab+'IdPService'){

            resolve(expanded);
        }else{
            reject('invalid');
        }
    });



};



var serviceValidatorRequest = function (req, res, next) {
    var contentTypes = ['application/json', 'application/ld+json'];
    if (_.indexOf(contentTypes, req.header('content-type')) < 0) {
        return res.status(400).json({'error': true, 'message': 'Invalid content-type'});
    }


    /**
     * @todo check if @context url matches application @context - need to change later
     */
    req.body['@context'] = context;

    var promise = jsonldPromises.expand(req.body);

    promise.then(function(expanded){
        return expanded;
    },function(err){
        return res.status(500).json({'error': true, 'message': 'Could not process with input'});
    }).then(processValidation).then(function(expanded){
        req.jsonldexpanded = expanded;
        next();
    }).catch();


    // return res.status(400).json({'error': true, 'message': 'Invalid json'});


};


module.exports.serviceValidatorRequest = serviceValidatorRequest;