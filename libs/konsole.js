'use strict';
var konsole = function(str, konsoleEnabled = false){
    if(konsoleEnabled) {
        console.log(str);
    }
};

module.exports = konsole;