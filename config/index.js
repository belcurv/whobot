/* jshint node: true, esversion:6 */

var cr = require('./config.json'),
    uname = process.env.DB_UNAME || cr.uname,
    pwd   = process.env.DB_PWD   || cr.pwd;

module.exports = {
    
    getDbConnectionString: function() {
        
        return `mongodb://${uname}:${pwd}@ds127260.mlab.com:27260/whobot`;
        
    }
    
};