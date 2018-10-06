const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');

router.post('/', function (req, res) {
    amqp.connect('amqp://ansible:ansible12@rabbitmq', function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'ansibletrigger';

            ch.assertQueue(q, {durable: true});
            // Note: on Node 6 Buffer.from(msg) should be used
            ch.sendToQueue(q, new Buffer('Hello World!'));
            console.log(" [x] Sent 'Hello World!'");
        });
    });
});
module.exports = router;