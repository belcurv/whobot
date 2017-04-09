/* jshint esversion:6, node:true */

var Profiles = require('../models/profileModel');

/* =========================== utility functions =========================== */
    
/* generate general help message
 *
 * @params    [string]   you   [user's name]
 * @returns   [string]         [user specific help message]
*/
function generateHelpResponse(you) {

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
function invalidRequest(you, msg) {
    return `Invalid request @${you}: *${msg}*`;
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


/* ================================ exports ================================ */

module.exports = {
    
    helpResponse: generateHelpResponse,
    
    
    // get one profile by team_id/user_name
    getOneProfile: function(postBody, res) {
        
        console.log(postBody);
        
        if (!/<@[a-z0-9]+/i.test(postBody.postText)) {
            return res
                .status(400)
                .send(invalidRequest(postBody.user_name, 'invalid username'));
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

    },
    
    
    // find profiles that contain matched 'skill'
    getMatchingProfiles: function(postBody, res) {
        
        // handle missing postText
        if (!postBody.postText || postBody.postText.length < 1) {
            return res
                .status(400)
                .send(invalidRequest(postBody.user_name, 'missing requested skill'));
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
        
    },


    // add a user profile
    addProfile: function(postBody, res) {
        
        // add 'skills' array property to POST body before saving
        // **** todo: map() through our skills dictionary to sanitize strings
        postBody.skills = (postBody.postText)
            .trim()
            .split(',')
            .map( (e) => e.trim() );
            // .map( (s) => fetchSkill(s) );  // <-- todo
        

        /* using .update() with {upsert: true} option, so that we UPDATE
           existing records and ADD records if they don't already exist.
           API: Model.update(conditions, doc, [options], [callback])
        */
        Profiles.update(
            { user_id : postBody.user_id },   // conditions
            postBody,                         // doc
            { upsert : true },                // options
            function (err) {                  // callback
                if (err) console.log('Error:', err);
            
                return res
                    .status(200)
                    .send('Success - profile saved');
            });
    },


    // delete a user profile
    deleteProfile: function(postBody, res) {
        
        var target = {
            team_id: postBody.team_id,
            user_id: postBody.user_id
        };

        Profiles.findOneAndRemove(target, function (err) {
            if (err) throw err;
            return res.status(200).send(`${postBody.user_name}'s profile has been deleted`);
        });

    }
};