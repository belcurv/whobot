/* jshint node:true, esversion:6 */

'use strict';

var bodyParser = require('body-parser'),
    Profiles   = require('../models/profileModel');


/* ============================ UTILITY METHODS ============================ */

// verify request tokenS
function goodToken(t) {
    return t === process.env.SLACK_VERIFICATION_TOKEN;
}



/* ============================= BOT FUNCTIONS ============================= */

// post a new profile
function postNewProfile(req, res) {
        
    if (!goodToken(req.token)) { return; }

    var newProfile = Profiles(
        {
            team_id      : req.body.team_id,
            team_domain  : req.body.team_domain,
            channel_id   : req.body.channel_id,
            channel_name : req.body.channel_name,
            timestamp    : req.body.timestamp,
            user_id      : req.body.user_id,
            user_name    : req.body.user_name,
            attrs        : req.body.text
        }
    );

    newProfile.save(function (err) {
        if (err) { throw err; }
        res.send('Success - new profile saved');
    });

}




/* ============================ EXPORT METHODS ============================= */

module.exports = {
    postNewProfile : postNewProfile
};