const jwt = require('jsonwebtoken');
const fs = require('fs');
const konsole = require('./konsole');
module.exports.aclCheck = function(req,res,next) {
    konsole('checkAcl triggered');
    /**
     * @todo finish
     */
    next();
};