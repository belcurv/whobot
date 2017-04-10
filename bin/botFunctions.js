/* jshint esversion:6, node:true */

var Profiles = require('../models/profileModel');

/* =========================== utility functions =========================== */
    
/* generate general help message
 *
 * @params    [string]   you   [user's name]
 * @returns   [object]         [user specific help message]
*/
function generateHelpResponse(you) {
    
    return {
        'respone_type': 'ephemeral',
        'attachments': [
            {
                'color': '#009999',
                'text': `Hi @${you}, I'm *Whobot*.\nI respond to the following commands:`,
                'fields': [
                    {
                        'title': '1. Tell Whobot what you know:',
                        'value': '```/whobot I know {skill_1, skill_2}```',
                        'short': false
                    },
                    {
                        'title': '2. Get a user\'s skills:',
                        'value': '```/whobot who is {@user_name}```',
                        'short': false
                    },
                    {
                        'title': '3. Get all users with a specified skill:',
                        'value': '```/whobot who knows {skill}```',
                        'short': false
                    },
                    {
                        'title': '4. Erase yourself from Whobot\'s memory:',
                        'value': '```/whobot forget me```',
                        'short': false
                    }
                ],
                'mrkdwn_in': ['fields', 'text'],
                'footer': `<https://whobot.herokuapp.com/ | whobot : v1.0.0> | <https://github.com/belcurv/whobot | GitHub>`
            }
        ]
    };
}


/* generate help message in response to invalid requests
 *
 * @params    [string]   you    [user's name]
 * @params    [string]   attr   [the missing attribute]
 * @returns   [string]          [user specific help message]
*/
function invalidRequest(you, msg) {
    return {
        'respone_type': 'ephemeral',
        'attachments': [
            {
                'color': '#c33',
                'text': `Sorry @${you}: *${msg}*`,
                'mrkdwn_in': ['text']
            }
        ]
    };    
}


/* generate response string for 'who knows' requests
 *
 * @params    [array]    profiles   [all matched profiles]
 * @params    [string]   skill      [the skill used in query]
 * @returns   [object]              [Slack response object]
*/
function whoKnowsResponse(profiles, skill) {

    var users = profiles
        .map( (profile) => `@${profile.user_name}` )
        .sort( (a, b) => {
            if (a.toLowerCase() < b.toLowerCase()) { return -1; }
            if (a.toLowerCase() > b.toLowerCase()) { return 1; }
            return 0;
        })
        .join(', '),
        
        count = profiles.length,

        // responses
        none = `*No team members know* \`${skill}\`.`,
        some = `*The following team members know* \`${skill}\` :\n\`\`\`${users}\`\`\``;
        
        return {
            'respone_type': 'ephemeral',
            'attachments': [
                {
                    'color': '#009999',
                    'text': (count === 0) ? none : some,
                    'mrkdwn_in': ['text'],
                    'footer': `Total: ${count}`
                }
            ]
        };
}


/* build target 'user' object for db search
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


/* =============================== bot logic =============================== */


/* get help response
 *
 * @params   [string]   user   [the user who issued the Slack command]
 * @params   [object]   res    [blank response object]
 * @returns  [object]          [populated response object]
*/
function helpResponse(user, res) {
        
    return res
        .status(200)
        .send(generateHelpResponse(user));

}


/* get one profile by team_id/user_name
 *
 * @params   [object]   postBody   [the formatted Slack POST body]
 * @params   [object]   res        [blank response object]
 * @returns  [object]              [populated response object]
*/
function getOneProfile(postBody, res) {
        
    //console.log(postBody);

    if (!/<@[a-z0-9]+/i.test(postBody.postText)) {
        return res
            .status(400)
            .send(invalidRequest(postBody.user_name, 'invalid username.'));
    }

    Profiles
        .findOne(userTarget(postBody)).exec()
        .then( (profile) =>  {
        
            // handle user not found
            if (!profile) {
                return res
                    .status(404)
                    .send(invalidRequest(postBody.user_name, `I don't know that team member.`));
            }
        
            let name   = profile.user_name,
                skills = profile.skills.join('\n'),
                time   = Date.parse(profile.timestamp) / 1000,
                data   = {
                    'respone_type': 'ephemeral',
                    'attachments': [
                        {
                            'color': '#009999',
                            'title': `@${name} knows:`,
                            'text': `\`\`\`${skills}\`\`\``,
                            'mrkdwn_in': ['text'],
                            'footer': 'Last updated',
                            'ts': time
                        }
                    ]
                };

            return res
                .status(200)
                .send(data);
        })
        .catch( (err) => console.log('Error:', err));

}


/* find profiles that contain matched 'skill'
 *
 * @params   [object]   postBody   [the formatted Slack POST body]
 * @params   [object]   res        [blank response object]
 * @returns  [object]              [populated response object]
*/
function getMatchingProfiles(postBody, res) {

    // handle missing postText
    if (!postBody.postText || postBody.postText.length < 1) {
        return res
            .status(400)
            .send(invalidRequest(postBody.user_name, 'missing requested skill.'));
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


/* add a user profile
 *
 * @params   [object]   postBody   [the formatted Slack POST body]
 * @params   [object]   res        [blank response object]
 * @returns  [object]              [populated response object]
*/
function addProfile(postBody, res) {
    
    // handle no skills
    if (!postBody.postText || postBody.postText.length < 1) {
        return res
            .status(400)
            .send(invalidRequest(postBody.user_name, 'you need include a list of skills.'));
    }    
    
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
            
            let you = postBody.user_name,
                time   = Date.parse(postBody.timestamp) / 1000,
                data = {
                    'respone_type': 'ephemeral',
                    'attachments': [
                        {
                            'color': '#009999',
                            'text': `Thanks @${you} - *profile saved*.`,
                            'mrkdwn_in': ['text'],
                            'footer': `Number of skills: ${postBody.skills.length}`
                        }
                    ]
                };  

            return res
                .status(200)
                .send(data);
        });
}


/* delete a user profile
 *
 * @params   [object]   postBody   [the formatted Slack POST body]
 * @params   [object]   res        [blank response object]
 * @returns  [object]              [populated response object]
*/
function deleteProfile(postBody, res) {

    var target = {
        team_id: postBody.team_id,
        user_id: postBody.user_id
    },
        you  = postBody.user_name,
        data = {
            'respone_type': 'ephemeral',
            'attachments': [
                {
                    'color': '#009999',
                    'text': `*Profile deleted* - sorry to see you go @${you}.`,
                    'mrkdwn_in': ['text']
                }
            ]
        };

    Profiles.findOneAndRemove(target, function (err) {
        if (err) throw err;
        return res.status(200).send(data);
    });

}


/* ================================ exports ================================ */

module.exports = {
    
    help     : helpResponse,
    whoIs    : getOneProfile,
    whoKnows : getMatchingProfiles,
    iKnow    : addProfile,
    forgetMe : deleteProfile
    
};
