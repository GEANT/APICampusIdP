'use strict';
const konsoleEnabled = false;
const konsole = function(str ){

    if(konsoleEnabled) {
        console.log.apply(console, arguments);
       // console.trace();
      //  console.log(str);
    }
};

module.exports = konsole;

