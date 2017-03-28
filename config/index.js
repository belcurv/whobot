/* jshint node: true, esversion:6 */

var env = process.env.NODE_ENV || 'development',
    cr, uname, pwd;

if (env === 'production') {
    uname = process.env.DB_UNAME;
    pwd   = process.env.DB_PWD;
} else {
    cr    = require('./config.json');
    uname = cr.uname;
    pwd   = cr.pwd;
}

module.exports = {
    
    getDbConnectionString: function() {
        
        return `mongodb://${uname}:${pwd}@ds127260.mlab.com:27260/whobot`;
        
    }
    
};