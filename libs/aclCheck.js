var jwt = require('jsonwebtoken');
var fs = require('fs');

module.exports.aclCheck = function(req,res,next) {
    console.log('checkAcl triggered');
    /**
     * @todo finish
     */
    next();
};