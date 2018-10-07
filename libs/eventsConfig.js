const qsender = require('./qsender');

module.exports = {
	events: {
		SPAWNIDP: 'spawnService'
	},
    listeners: {
	    SPAWNIDP: [
	        function(arg){
	           qsender(arg);
            }
        ]
    }
};
