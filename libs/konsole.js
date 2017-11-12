'use strict';
const konsoleEnabled = true;
const konsole = function(str, konsoleEnabled = false){
    if(konsoleEnabled) {
        console.log(str);
    }
};

module.exports = konsole;