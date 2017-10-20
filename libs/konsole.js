'use strict';
const konsoleEnabled = false;
var konsole = function(str){
    if(konsoleEnabled) {
        console.log(str);
    }
};

module.exports = konsole;