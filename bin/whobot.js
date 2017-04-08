/* bin/whobot.js */
/* jshint node: true, esversion:6 */

/*
 ESCAPED Slack POST looks like this
    {
        team_id: 'T43U70EMR',
        team_domain: 'hardlyknewhim',
        channel_id: 'C439EPS1E',
        channel_name: 'general',
        user_id: 'U44M4PF8X',
        user_name: 'jay',
        postText: 'who is <@U44M4PF8X|jay>',
        timestamp: 2017-03-28T03:13:28.465Z
    }

*/

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
    
    
    /* ========================= utility functions ========================= */
    
    /* generate general help message
     *
     * @params    [string]   you   [user's name]
     * @returns   [string]         [user specific help message]
    */
    function helpResponse(you) {
                
        return [
            `Hi @${you}, I'm *Whobot*. I respond to the following commands:`,
            `\`\`\``,
            `/whobot I know {skill_1, skill_2}    // tell Whobot what you know`,
            `/whobot who is {@user_name}          // get a user's skills`,
            `/whobot who knows {skill}            // get all users with a skill`,
            `/whobot forget me                    // tell Whobot to forget you`,
            `\`\`\``,
        ].join('\n');
    }
    
    
    /* generate help message in response to invalid requests
     *
     * @params    [string]   you    [user's name]
     * @params    [string]   attr   [the missing attribute]
     * @returns   [string]          [user specific help message]
    */
    function invalidRequest(you, attr) {
        return `Invalid request @${you}: *missing ${attr}*`;
    }

    
    /* generate response string for 'who knows' requests
     *
     * @params    [array]    profiles   [all matched profiles]
     * @params    [string]   skill      [the skill used in query]
     * @returns   [string]              [response message]
    */
    function whoKnowsResponse(profiles, skill) {
        
        var users = profiles
            .map( (profile) => `@${profile.user_name}` )
            .join(', '),
            
            // responses
            none = `No team members know *${skill}*.`,
            one  = `Team member *${users}* knows *${skill}*.`,
            some = `The following team members know *${skill}*:\n*${users}*`;
        
        return (!profiles.length) ? none :
            (profiles.length === 1) ? one : some;
    }
    
    
    /* check for valid user ID
     *
     * @params    [string]   text   [user name from POST psotText property]
     * @returns   [boolean]         [true if 'text' contains Slack user ID]
    */
    function validUser(text) {
        return /<@[a-z0-9]+/i.test(text);
    }
    
    
    /* build target 'user object for db search
     *
     * @params    [object]   pb   [postBody object]
     * @returns   [object]        [formatted user object for db query]
    */
    function userTarget(pb) {
        return {
            user_id : pb.postText.match(/<@[a-z0-9]+/i)[0].replace('<@', ''),
            team_id : pb.team_id
        };
    }
    
    
    /* ============================== db work ============================== */
    
    // get one profile by team_id/user_name
    function getOneProfile() {
        
        console.log(postBody);
        
        if (!validUser(postBody.postText)) {
            return res
                .status(400)
                .send(invalidRequest(postBody.user_name, '@ in username'));
        }
        
        Profiles
            .findOne(userTarget(postBody)).exec()
            .then( (profile) =>  {
            
                let name   = profile.user_name,
                    skills = profile.skills.join(', ');
            
                return res
                    .status(200)
                    .send(`Team member *${name}* knows:\n*${skills}*`);
            })
            .catch( (err) => console.log('Error:', err));

    }
    
    
    // find profiles that contain matched 'skill'
    function getMatchingProfiles() {
        
        // handle missing postText
        if (!postBody.postText || postBody.postText.length < 1) {
            return res
                .status(400)
                .send(invalidRequest(postBody.user_name, 'requested skill'));
        }
        
        // capture requested skill
        // *** todo: parse requested skill through our skills dictionary
        var skill = postBody.postText.split(/,|\s/)[0];
        
        // find documents where 'skill' in 'skills'
        Profiles
            .find({ skills: skill }).exec()
            .then( (profiles) => {

                return res
                    .status(200)
                    .send(whoKnowsResponse(profiles, skill));
            
            })
            .catch( (err) => console.log('Error:', err));
        
    }


    // add a user profile
    function addProfile() {
        
        // *** todo: if user already exists, update existing record
        
        
        // add 'skills' array property to POST body before saving
        // **** todo: map() through our skills dictionary to sanitize strings
        postBody.skills = (postBody.postText)
            .trim()
            .split(',')
            .map( (e) => e.trim() );
            // .map( (s) => fetchSkill(s) );  // <-- todo
                
        Profiles(postBody)
            .save( (err) => {
                if (err) console.log('Error:', err);
            
                return res
                    .status(200)
                    .send('Success - new profile saved');
            });
    }


    // delete a user profile
    function deleteProfile() {
        
        var target = {
            team_id: postBody.team_id,
            user_id: postBody.user_id
        };

        Profiles.findOneAndRemove(target, function (err) {
            if (err) throw err;
            return res.status(200).send(`${postBody.user_name}'s profile has been deleted`);
        });

    }

    
    /* ========================= response branches ========================= */
    
    // avoid infinite loop so the bot can't call itself
    if (postBody.user_name !== 'slackbot') {
        
          switch(true) {
                
            case /^who is/gi.test(postBody.postText):
                // respond with a team member's profile
                postBody.postText = req.body.text.substring(7);
                getOneProfile();
                break;
                
            case /^who knows/gi.test(postBody.postText):
                // find all users who know a specified skill
                postBody.postText = req.body.text.substring(10);
                getMatchingProfiles();
                break;
                  
            case /^I know/gi.test(postBody.postText):
                // post user's profile to database
                postBody.postText = req.body.text.substring(7);
                addProfile();
                break;
                
            case /^forget me/gi.test(postBody.postText):
                // delete user's profile from database
                postBody.postText = req.body.text.substring(9);
                deleteProfile();
                break;
                
            default:
                // respond with help commands
                return res.status(200).send(helpResponse(postBody.user_name));
        }

    } else {

        return res.status(200).end();
    
    }
    
};
