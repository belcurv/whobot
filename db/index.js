/* jshint node: true, esversion:6 */

const dotenv = require('dotenv').config(),
      uname  = process.env.DB_UNAME,
      pwd    = process.env.DB_PWD;

module.exports = {
    
    getDbConnectionString: function() {
        
        return `mongodb://${uname}:${pwd}@ds127260.mlab.com:27260/whobot`;
        
    }
    
};