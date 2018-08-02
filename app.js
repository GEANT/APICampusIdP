'use strict';
const fs = require('fs');
const _ = require('lodash');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const yaml = require('write-yaml');
const passport = require('passport');
const jsonld = require('jsonld');
const nconf = require('nconf');
const rfs = require('rotating-file-stream');
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});


const verifyToken = require('./libs/verifyToken');

/**
 * routes
 */
const index = require('./routes/index');
const users = require('./routes/users');
const idp = require('./routes/idp');
const clientapi = require('./routes/clientapi');
const authenticate = require('./routes/authenticate');
const jsonldContext = require('./routes/jsonldContext');
const apiSchema = require('./routes/apiSchema');
const konsole = require('./libs/konsole');
/**
 * config
 */
const appConfig = require('./libs/serviceConfig');
const configer = require('./libs/serviceConfig');


const app = express();

const useHttps = configer.get("forcehttps") || false;
const httpsPort = parseInt(configer.get("https:port"), 10);
const httpPort = parseInt(configer.get("http:port"),10);
// will be used later if node is set behind proxy //
const behindProxy = false;
let proxyPort = parseInt(configer.get("proxy:port"),10);
let proxyProtocol = configer.get("proxy:protocol") || "https";
const hostname = configer.get("hostname");
if (behindProxy) {
    if (proxyProtocol === 'http') {
        if (proxyPort !== 80) {
            app.set('baseurl', 'http://' + hostname + '/');
        }
        else {
            app.set('baseurl', 'http://' + hostname + ':' + proxyPort + '/');
        }
    }
    else {
        if (proxyPort !== 443) {
            app.set('baseurl', 'https://' + hostname + '/');
        }
        else {
            app.set('baseurl', 'https://' + hostname + ':' + proxyPort + '/');
        }
    }
}
else {
    if (httpPort !== 80) {
        app.set('baseurl', 'http://' + hostname + ':' + httpPort + '/');
    }
    else {
        app.set('baseurl', 'http://' + hostname + '/');
    }
}

app.set('appConfig', appConfig);
const db_settings = appConfig.get('database');
const dbUser = nconf.get("DB:USER") || db_settings.user;
const dbPass = nconf.get("DB:PASSWORD")||db_settings.pass;
const dbHost = nconf.get("DB:HOST")||db_settings.host;
const dbPort = nconf.get("DB:PORT")||db_settings.port;
const dbName = nconf.get("DB:NAME")||db_settings.dbname;
const db_uri = 'mongodb://' + dbUser + ':' + dbPass + '@' + dbHost + ':' + dbPort + '/' + dbName + '';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const version = require('mongoose-version');
if(process.env.NODE_ENV !== 'test') {
    mongoose.connect(db_uri, {
        useMongoClient: true,
        /* other options */
    }).then().catch(err => {

        console.log('ZZZZZ');
    });
}





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.options('*', cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.json({type: 'application/ld+json'}));
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError &&
        error.status >= 400 && error.status < 500 &&
        error.message.indexOf('JSON')) {
        return res.status(error.status).json({"error": true, "message": error.message});
    }
    next();
});
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/authenticate', authenticate);
app.use('/users', users);
app.use('/idp', idp);
// client api ui
app.use('/clientapi', clientapi);

app.use('/context', jsonldContext);
app.use('/schema', apiSchema);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
