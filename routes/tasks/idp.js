const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const qSender = require('../../libs/qsender');
const Provider = require('../../models/Provider');
const User = require('../../models/User');
const Job = require('../../models/Job');
const errorPrefix = "252";
const verifyToken = require('../../libs/verifyToken');
const Emmitter = require('events');
const eventsConfig = require('../../libs/eventsConfig').events;



router.get('/:name', verifyToken, function(req,res){
    let name = req.params.name;
    let pPromise = Provider.findOne({name: name});
    let username = res.locals.tokenDecoded.sub;
    let uPromise = User.findOne({username: username});
    Promise.all([pPromise, uPromise]).then(
        (results) => {
            let provider = results[0];
            let user = results[1];
            if (user === null) {
                return res.status(401).json({"error": true, "message": "Not permitted", "id": errorPrefix + "007"});
            }
            if (provider !== null) {

                /**
                 * @todo improve permission
                 * */
                let isPermitted = provider.creator._id.equals(user._id);


                if (isPermitted) {

                    let jobs = Job.find({provider: provider}).populate('creator');
                    jobs.then( (tasks) =>{
                        let tasksList = [];
                        if(tasks) {
                            for(let i = 0; i < tasks.length; i++ ){
                                tasksList.push({
                                    name: tasks[i].name,
                                    created: tasks[i].createdAt,
                                    creator: tasks[i].creator.username,
                                    states: tasks[i].states
                                })
                            }
                        }
                        return res.json(tasksList);
                    } )

                }
                else {
                    return res.status(401).json({
                        "error": true,
                        "message": "Authorization failed-",
                        "id": errorPrefix + "008"
                    });
                }


            }
            else {
                return res.status(404).json({"error": true, "message": "Not found", "id": errorPrefix + "010"});
            }
        }
    ).catch(err => {
        return res.send(err);
    });
});

router.post('/:name', verifyToken, function (req, res) {

    let name = req.params.name;
    let taskName = req.body.task;
    if (typeof taskName === 'undefined' || taskName !== 'ansible') {
        return res.status(400).json({
            "error": true,
            "message": "Task request not supported",
            "id": errorPrefix + "006"
        });
    }

    /**
     * @todo move following to middleware
     */
    let pPromise = Provider.findOne({name: name});
    let username = res.locals.tokenDecoded.sub;
    let uPromise = User.findOne({username: username});
    Promise.all([pPromise, uPromise]).then(
        (results) => {
            let provider = results[0];
            let user = results[1];
            if (user === null) {
                return res.status(401).json({"error": true, "message": "Not permitted", "id": errorPrefix + "007"});
            }
            if (provider !== null) {

                /**
                 * @todo improve permission
                 * */
                let isPermitted = provider.creator._id.equals(user._id);


                if (isPermitted) {

                    let job = new Job({
                        name: 'spawnService',
                        provider: provider,
                        creator: user,
                        sourceIP: req.connection.remoteAddress
                    });
                    job.save()
                        .then(resolve => {

                            // trigger event
                            let emtr = req.app.get('emtr');

                            let eventArgs = {
                                src:  req.app.get('baseurl')+'idp/ansible/'+provider.name,
                                status_endpoint: req.app.get('baseurl')+'tasks/job/'+job._id,
                                apitoken: req.app.get('x-api-token'),
                                qtoken: job.qtoken
                            };
                            emtr.emit(eventsConfig.SPAWNIDP,eventArgs);


                            return res.json(_.pick(resolve.toJSON(), ['_id', 'name', 'qtoken','provider.name','creator.username']));
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(400).json({error: true, message: err, id: errorPrefix + "002"});
                        });
                }
                else {
                    return res.status(401).json({
                        "error": true,
                        "message": "Authorization failed-",
                        "id": errorPrefix + "008"
                    });
                }


            }
            else {
                return res.status(404).json({"error": true, "message": "Not found", "id": errorPrefix + "010"});
            }
        }
    ).catch(err => {
        return res.send(err);
    });


    //  qSender(JSON.stringify(msg));

});
module.exports = router;