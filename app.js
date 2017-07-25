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


/**
 * routes
 */
var index = require('./routes/index');
var users = require('./routes/users');
var idp = require('./routes/idp');
var clientapi = require('./routes/clientapi');
var authenticate = require('./routes/authenticate');


/**
 * config
 */
var appConfig = require('./libs/config/index');

var app = express();





var db_settings = appConfig.get('database');
var mongoose = require('mongoose');
var db_uri = 'mongodb://'+db_settings.user+':'+db_settings.pass+'@'+db_settings.host+':'+db_settings.port+'/'+db_settings.dbname+'';
console.log('db_uri: '+db_uri);
var promise = mongoose.connect(db_uri, {
  useMongoClient: true,
  /* other options */
});





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/authenticate', authenticate);
app.use('/users', users);
app.use('/idp', idp);
// client api ui
app.use('/clientapi',clientapi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
