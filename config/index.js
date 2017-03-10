/* jshint node: true, esversion:6 */

var cr = require('./config.json');

module.exports = {
    
    getDbConnectionString: function() {
        
        return `mongodb://${cr.uname}:${cr.pwd}@ds127260.mlab.com:27260/whobot`;
        
    }
    
};