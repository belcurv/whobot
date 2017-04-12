/* jshint node: true */

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    profileSchema = new Schema(
        {
            'team_id'     : String,
            'team_domain' : String,
            'channel_id'  : String,
            'channel_name': String,
            'user_id'     : String,
            'user_name'   : String,
            'postText'    : String,
            'timestamp'   : String,
            'skills'      : Array
        }
    ),
    Profiles = mongoose.model('Profiles', profileSchema);

module.exports = Profiles;
