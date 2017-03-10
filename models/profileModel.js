/* jshint node: true */

/* ** is this what we will get ???
{
    token=iVRLkKboiMLjuvge8lpkqbxa
    team_id=T0001
    team_domain=example
    channel_id=C2147483705
    channel_name=test
    timestamp=1355517523.000005
    user_id=U2147483697
    user_name=Steve
    text=googlebot: What is the air-speed velocity of an unladen swallow?
}
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    profileSchema = new Schema(
        {
            'team_id'     : String,
            'team_domain' : String,
            'channel_id'  : String,
            'channel_name': String,
            'timestamp'   : String,
            'user_id'     : String,
            'user_name'   : String,
            'attrs'       : String
        }
    ),
    Profiles = mongoose.model('Profiles', profileSchema);

module.exports = Profiles;
