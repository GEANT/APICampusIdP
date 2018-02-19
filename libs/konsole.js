'use strict';
const konsoleEnabled = true;
const konsole = function(str ){
    if(konsoleEnabled) {
        console.log(str);
    }
};

module.exports = konsole;

