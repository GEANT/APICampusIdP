var _ = require('lodash');
var jsonld = require('jsonld');
var jsonldPromises = jsonld.promises;

var vocab = require('./apiVocab').context;
var context = vocab;
var myVocab = context['@vocab'];

var genKeyWithPref  = function(key){
    return myVocab+key;
}

var validateWebComponent = function(expand){
    console.log('validateWebComponent: triggered');
    return new Promise(function(resolve, reject){

         resolve(expand);


        console.log('FG: '+expand[genKeyWithPref('components')]);
        if(expand[genKeyWithPref('components')] !== undefined && expand[genKeyWithPref('components')][genKeyWithPref('web')]){
            var myNode = expand[genKeyWithPref('components')][genKeyWithPref('web')];
            console.log('FF: '+JSON.stringify(myNode));
            resolve(expand);
        }
        else {
            console.log('validateWebComponent : failure');
            reject('components are invalid');
        }


        //https://geant.org/campusidp/web
    });
};

var processValidation = function(expanded){


    return new Promise(function(resolve,reject){

        console.log('myVocab: '+myVocab+'   --- '+JSON.stringify(expanded[0]['@type']));

        validateWebComponent(expanded).then(function(){
            if(expanded[0]['@type'][0] === myVocab+'IdPService'){
                console.log('processValidation: success');
                resolve(expanded);
            }else{
                console.log('processValidation: failure');
                reject('invalid');
            }
        }).catch(function(error){
            reject(error);
        });


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

    promise.then(processValidation).then(function(expanded){

        req.jsonldexpanded = expanded;
  //      console.log('FINAL: '+JSON.stringify(req.jsonldexpanded));
        console.log('FINAL: '+JSON.stringify(req.jsonldexpanded));
        next();

    }).catch(function(error){
        console.log('Error catch: '+error);
        return res.status(400).json({'error': true, 'message': 'Invalid request'});
    });


    // return res.status(400).json({'error': true, 'message': 'Invalid json'});


};


module.exports.serviceValidatorRequest = serviceValidatorRequest;