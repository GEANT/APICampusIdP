const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/idpapi_test', {
    useMongoClient: true
});
mongoose.connection
    .once('open', () => {
            console.log('Mongoose status: Good to go');
        }
    )
    .on('error', (error) => {
        console.warn('Warning', error);
    });

