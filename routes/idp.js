var express = require('express');
var router = express.Router();



var validateIDPConf = require('../libs/Idpconfigurator').validateIDPConf;



var generatesYamlFiles = function(cnf){

    // generate attribute resolver part
    // go through objects and check '@type' === 'AttributeDefinition'

};

router.post('/', function (req, res) {
    console.log('----------START REQUEST----------------');
    console.log('post sent::: ');
    console.log('headers::: ' + JSON.stringify(req.headers));
    console.log('body::: ' + JSON.stringify(req.body));



    if (validateIDPConf(req.body)) {
        res.send('Json is VALID\n');
    }
    else {
        res.send('Json is INVALID\n');
    }

    console.log('----------END REQUEST------------');

});
module.exports = router;

