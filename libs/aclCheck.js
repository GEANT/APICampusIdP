const jwt = require('jsonwebtoken');
const fs = require('fs');
const konsole = require('./konsole');
const errPrefix= "311";
module.exports.aclCheck = function(req,res,next) {
    konsole('checkAcl triggered');
    /**
     * @todo finish
     */
    next();
};