const amqp = require('amqplib');
const configer = require('./serviceConfig');




const amqHost = configer.get("amq:host");
const amqUser = configer.get("amq:user");
const amqPassword = configer.get("amq:password");
const q = 'ansibletrigger';




const qSender = (args) => {


    let open = amqp.connect('amqp://'+amqUser+':'+amqPassword+'@'+amqHost);

// Publisher
    open.then(function(conn) {
        return conn.createChannel();
    }).then(function(ch) {
        return ch.assertQueue(q).then(function(ok) {
            return ch.sendToQueue(q, new Buffer(JSON.stringify(args)));

        });
    }).catch(console.warn);
};


module.exports = qSender;