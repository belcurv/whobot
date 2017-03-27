/* jshint node: true */

/* https://api.slack.com/slash-commands
{
    token=gIkuvaNzQIHg97ATvDxqgjtO
    team_id=T0001
    team_domain=example
    channel_id=C2147483705
    channel_name=test
    user_id=U2147483697
    user_name=Steve
    command=/weather
    text=94070
    response_url=https://hooks.slack.com/commands/1234/5678
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
            'user_id'     : String,
            'user_name'   : String,
            'postText'    : String,
            'timestamp'   : String  // we generate this
        }
    ),
    Profiles = mongoose.model('Profiles', profileSchema);

module.exports = Profiles;
