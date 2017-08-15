var fs = require('fs');
var _ = require('lodash');
var express = require('express');
var jwt = require('jsonwebtoken');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var yaml = require('write-yaml');
var passport = require('passport');
var jsonld = require('jsonld');
var rfs = require('rotating-file-stream');
var logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});


var verifyToken = require('./libs/verifyToken');

/**
 * routes
 */
var index = require('./routes/index');
var users = require('./routes/users');
var idp = require('./routes/idp');
var clientapi = require('./routes/clientapi');
var authenticate = require('./routes/authenticate');
var protectedtest = require('./routes/protectedtest');
var jsonldContext = require('./routes/jsonldContext');

/**
 * config
 */
var appConfig = require('./libs/config/index');

var app = express();
app.set('appConfig', appConfig);


var db_settings = appConfig.get('database');
var db_uri = 'mongodb://' + db_settings.user + ':' + db_settings.pass + '@' + db_settings.host + ':' + db_settings.port + '/' + db_settings.dbname + '';
var mongoose = require('mongoose');

var version = require('mongoose-version');

mongoose.connect(db_uri, {
    useMongoClient: true,
    /* other options */
});
mongoose.Promise = global.Promise;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


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
app.use('/protectedtest', verifyToken, protectedtest);
app.use('/context', jsonldContext);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
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
