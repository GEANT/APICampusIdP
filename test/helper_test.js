const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://idpapi_test:idpapi_test@localhost/idpapi_test', {
    useNewUrlParser: true
});
mongoose.connection
    .once('open', () => {
            console.log('Mongoose status: Good to go');
        }
    )
    .on('error', (error) => {
        console.warn('Warning', error);
    });

