/* bin/whobot.js */
/* jshint node: true, esversion:6 */

var BotFunctions = require('./botFunctions.js');

module.exports = function (req, res, next) {
    
    if (req.body.token !== process.env.VERIFICATION_TOKEN) {
        // request is NOT coming from Slack - abort
        return;
    }
    
    // assemble info from Slack POST
    var postBody = {
        team_id      : req.body.team_id,
        team_domain  : req.body.team_domain,
        channel_id   : req.body.channel_id,
        channel_name : req.body.channel_name,
        user_id      : req.body.user_id,
        user_name    : req.body.user_name,
        postText     : req.body.text,
        timestamp    : new Date()
    };
    
    
    /* ========================= response branches ========================= */
    
    switch(true) {

        case /^who is/gi.test(postBody.postText):
            // respond with a team member's profile
            postBody.postText = req.body.text.substring(7);
            BotFunctions.whoIs(postBody, res);
            break;

        case /^who knows/gi.test(postBody.postText):
            // find all users who know a specified skill
            postBody.postText = req.body.text.substring(10);
            BotFunctions.whoKnows(postBody, res);
            break;

        case /^I know/gi.test(postBody.postText):
            // post user's profile to database
            postBody.postText = req.body.text.substring(7);
            BotFunctions.iKnow(postBody, res);
            break;

        
        case /^forget me/gi.test(postBody.postText):
            // delete user's profile from database
            postBody.postText = req.body.text.substring(9);
            BotFunctions.forgetMe(postBody, res);
            break;

        case /^forget/gi.test(postBody.postText):
            // delete specified skill from user's profile
            postBody.postText = req.body.text.substring(7);
            BotFunctions.forgetSkill(postBody, res);
            break;
            
        default:
            // default response: show commands
            BotFunctions.help(postBody.user_name, res);
    }
    
};
