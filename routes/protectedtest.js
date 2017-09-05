var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var version = require('mongoose-version');
var jsonld = require('jsonld');
var Provider = require('../models/Provider');
var context = require('../libs/apiVocab').context;


router.post('/jsonld', function (req, res) {
    var data = req.body;
    jsonld.expand(data,  function (err, compacted) {


        res.send(compacted);

    });


});

router.post('/', function (req, res) {
    var data = req.body;
    Provider.findOne({entityID: "zUPA"}, function (err, ent1) {
        if (!err) {
            if (!ent1) {
                ent1 = new Provider({
                    entityID: "zUPA",

                });

                ent1.createdBy = 'df';
            }
            if (data['@type'] === 'IdPConf') {
                ent1.data = data;
            }

            ent1.save(function (err) {

                if (err) {
                    console.log(err);
                    res.json({error: true});
                }
                else {
                    console.log("Provider Saved Successfully");
                    res.json(req.body);
                }

            });

        }
    });


});


module.exports = router;