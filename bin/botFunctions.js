/* jshint esversion:6, node:true */

const Profiles   = require('../models/profileModel'),
      fetchSkill = require('./fetchSkill'),
      okColor    = '#008080',
      badColor   = '#c33';

/* =========================== utility functions =========================== */
    
/* generate general help message
 *
 * @params    [string]   you   [user's name]
 * @returns   [object]         [user specific help message]
*/
function generateHelpResponse(you) {
    
    return {
        'response_type': 'ephemeral',
        'attachments': [
            {
                'color': okColor,
                'text': `Hi @${you}, I'm *Whobot*.\nI respond to the following commands:`,
                'fields': [
                    {
                        'title': '1. Tell Whobot what you know:',
                        'value': '```/whobot I know <skill_1>, <skill_2>```',
                        'short': false
                    },
                    {
                        'title': '2. Get a user\'s skills:',
                        'value': '```/whobot who is @user_name```',
                        'short': false
                    },
                    {
                        'title': '3. Get all users with a specified skill:',
                        'value': '```/whobot who knows <skill>```',
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
        'response_type': 'ephemeral',
        'attachments': [
            {
                'color'     : badColor,
                'text'      : `Sorry @${you}: *${msg}*`,
                'mrkdwn_in' : ['text']
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
        some = `*The following team members know* \`${skill}\`\n\`\`\`${users}\`\`\``;
        
        return {
            'response_type': 'ephemeral',
            'attachments': [
                {
                    'color'     : okColor,
                    'text'      : (count === 0) ? none : some,
                    'mrkdwn_in' : ['text'],
                    'footer'    : `Total: ${count}`
                }
            ]
        };
}


/* parse skill string through fetchSkill()
 *
 * @params    [string]   str   [the raw input string]
 * @returns   [string]         [normalized skill name from DD]
*/
function parseSkill(str) {
    const ogSkill = str.split(/,|\s/)[0];
    return fetchSkill(ogSkill);
}


/* escape skill string for friendly regex
 *   escapes:  +  -  .  /  [  ]
 *
 * @params    [string]   sk   [the original skill name]
 * @returns   [string]        [skill with escaped characters]
*/
function escapeSkill(sk) {
    return sk
        .replace( /\+/g, `\\+`)
        .replace( /\-/g, `\\-`)
        .replace( /\./g, `\\.`)
        .replace( /\//g, `\\/`)
        .replace( /\[/g, `\\[`)
        .replace( /\]/g, `\\]`);
}


/* build sanitized & normalized skills list
 *
 * @params    [string]   skills   [original raw comma separated list]
 * @returns   [array]             [normalized de-duped array of skills]
*/
function buildSkills(skills) {
    var seen = {};
    
    return skills
        .replace(/^{|}$/gm, '')    // remove enclosing {curly braces}
        .split(',')                // make array
        .map( (s) => s.replace(/\band\b/g, '') )  // remove any 'and'
        .map( (e) => fetchSkill(e.trim()) )       // trim and normalize
        .filter( (i) => seen.hasOwnProperty(i) ? false : (seen[i] = true) );  // de-dupe
}


/* ============================ public methods ============================= */

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
        let name = postBody.user_name,
            msg  = `invalid username: ${postBody.postText}`;
        
        return res
            .status(400)
            .send(invalidRequest(name, msg));
    }
    
    const uid = postBody.postText.match(/<@[a-z0-9]+/i)[0].replace('<@', ''),
          user = {
              user_id : uid,
              team_id : postBody.team_id
          };
    

    Profiles
        .findOne(user).exec()
        .then( (profile) =>  {
        
            // handle user not found
            if (!profile) {
                
                let name = postBody.user_name,
                    msg  = `I don't know that team member.`;
                
                return res
                    .status(404)
                    .send(invalidRequest(name, msg));
            }
        
            let name   = profile.user_name,
                skills = profile.skills.join('\n'),
                time   = Date.parse(profile.timestamp) / 1000,
                data   = {
                    'response_type': 'ephemeral',
                    'attachments': [
                        {
                            'color'     : okColor,
                            'title'     : `@${name} knows:`,
                            'text'      : `\`\`\`${skills}\`\`\``,
                            'mrkdwn_in' : ['text'],
                            'footer'    : 'Last updated',
                            'ts'        : time
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

    var parsedSkill  = parseSkill(postBody.postText),
        escapedSkill = escapeSkill(parsedSkill);

    // find documents where 'skill' in 'skills' and
    // team_id matches the posting user's team_id
    Profiles
        .find({
            skills: {
                $regex: new RegExp('^' + escapedSkill, 'i')
            },
            team_id: postBody.team_id
        })
        .exec()
        .then( (profiles) => {
        
            return res
                .status(200)
                .send(whoKnowsResponse(profiles, parsedSkill));

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
        let name = postBody.user_name,
            msg  = 'you need to include a list of skills.';
        
        return res
            .status(400)
            .send(invalidRequest(name, msg));
    }    
    
    // add 'skills' array property to POST body before saving
    postBody.skills = buildSkills(postBody.postText);
    
    // do the work
    Profiles.update(
        { user_id : postBody.user_id },   // conditions
        postBody,                         // doc
        { upsert : true },                // options
        function (err) {                  // callback
            if (err) console.log('Error:', err);
            
            let you   = postBody.user_name,
                time  = Date.parse(postBody.timestamp) / 1000,
                count = postBody.skills.length,
                data  = {
                    'response_type': 'ephemeral',
                    'attachments': [
                        {
                            'color'    : okColor,
                            'text'     : `Thanks @${you} - *profile saved*.`,
                            'mrkdwn_in': ['text'],
                            'footer'   : `Number of skills: ${count}`
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
            'response_type': 'ephemeral',
            'attachments': [
                {
                    'color'     : okColor,
                    'text'      : `*Profile deleted* - nice knowing you @${you}.`,
                    'mrkdwn_in' : ['text']
                }
            ]
        };

    Profiles.findOneAndRemove(target, function (err) {
        if (err) throw err;
        return res.status(200).send(data);
    });

}


/* =========================== expose public api =========================== */

module.exports = {
    
    help     : helpResponse,
    whoIs    : getOneProfile,
    whoKnows : getMatchingProfiles,
    iKnow    : addProfile,
    forgetMe : deleteProfile
    
};
