/* bin/whobot.js */
/* jshint node: true, esversion:6 */

var bodyParser = require('body-parser'),
    Profiles   = require('../models/profileModel');

module.exports = function (req, res, next) {
    
    // collect info from the POST
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
    
    // define container for our response messages
    var botPayload = {};
    
    
    /* ======================== response generators ======================== */
    
    function helpResponse(you) {
                
        return [
            `Hi @${you}, I'm *Whobot*. I respond to the following commands:`,
            `\`\`\``,
            `/whobot who is @user_name              // fetch details for @user_name`,
            `/whobot I know skill_1, skill_2 ...    // give Whobot a list of your skills`,
            `/whobot forget me                      // tell Whobot to forget about you`,
            `\`\`\``,
        ].join('\n');
    }
    
    
    /* ============================== db work ============================== */
    
    // get one profile by team_domain/user_name
    function getOneProfile() {
        
        var target = {
            user_name   : /@\w+/g.exec(postBody.postText)[0],
            team_domain : postBody.team_domain
        };

        Profiles.findOne(target, function (err, profile) {
            if (err) { throw err; }
            return res.status(200).send(profile);
        });

    }


    // add a user profile
    function addProfile() {
        
        Profiles(postBody)
            .save(function (err) {
                if (err) { throw err; }
                return res.status(200).send('Success - new profile saved');
            });
    }


    // delete a user profile
    function deleteProfile() {
        
        var target = {
            team_id: postBody.team_id,
            user_id: postBody.user_id
        };

        Profiles.findOneAndRemove(target, function (err) {
            if (err) { throw err; }
            return res.status(200).send(`${postBody.user_name}'s profile has been deleted`);
        });

    }

    
    /* ========================= response branches ========================= */
    
    // avoid infinite loop so the bot can't call itself
    if (postBody.user_name !== 'slackbot') {
        
          switch(true) {
                
            case /who is/gi.test(postBody.postText):
                // respond with a team member's profile
                getOneProfile();
                break;
                
            case /I know/gi.test(postBody.postText):
                // post user's profile to database
                addProfile();
                break;
                
            case /forget me/gi.test(postBody.postText):
                // delete user's profile from database
                deleteProfile();
                break;
                
            default:
                // respond with help commands
                return res.status(200).send(helpResponse(postBody.user_name));
        }

        // return res.status(200).json(botPayload);

    } else {

        return res.status(200).end();
    
    }
    
};
