/* jshint esversion:6, node:true */

const Profiles   = require('../models/profileModel'),
      fetchSkill = require('./fetchSkill');


module.exports = {

    getAllUsers: function () {
        return Profiles
            .find({})
            .exec()
            .then( (users) => {
                
                return users.map( (u) => {
                    return {
                        name: u.user_name,
                        team: u.team_domain,
                        skills: u.skills,
                        count: (u.skills).length
                    };
                });
            });

    },

    /* return all skills from database
     *
     * @returns   [array]    [array of skills]
    */
    getAllSkills : function(callback) {
        Profiles
            .find({}, 'skills')
            .exec()
            .then( (db_skills) => {
                var skill_list = [];
                db_skills.forEach( (user_skills) => {
                  user_skills.skills.forEach( (skill) => {
                    skill_list.push(skill);
                  });
                });
                callback(skill_list.sort());
            })
            .catch( (err) => console.log('Error:', err));
    },

    /* return list of unique skills from database
     *
     * @returns   [array]    [deduplicated list of skills]
    */
    getSkillList : function(callback) {
        var unique_skill_list = [];
        this.getAllSkills((full_skill_list) => {
            full_skill_list.forEach((skill) => {
                if (unique_skill_list.indexOf(skill) < 0) {
                    unique_skill_list.push(skill);
                }
            });
            callback(unique_skill_list.sort());
        });
    },

    /* count number of users with each skill in database
     *
     * @returns   [object]    [ {skill : # of users} ]
    */
    countSkills : function(callback) {
        var skill_tally = {};
        this.getAllSkills((full_skill_list) => {
            full_skill_list.forEach((skill) => {
                if (skill_tally[skill] === undefined) {
                    skill_tally[skill] = 1;
                } else {
                    skill_tally[skill] += 1;
                }
            });
            callback(skill_tally);
        });            
    },

    /* generate a skill histogram
     *
     * @returns   [string]    [ascii histogram of skill occurrences]
    */
    chartSkills : function(callback) {
        var skill_index = 0,
            chart_index = 0,
            chart = [],
            chart_output = '',
            stat, j,
            padded_skills;

        this.countSkills( function(skill_obj) {
            padded_skills = paddedArray(skill_obj);
            for ( stat in skill_obj ) {
                if ( skill_obj[stat] ) {
                    chart.push(padded_skills[skill_index]);
                    chart[chart_index] += ': ';
                    for ( j = 0; j < skill_obj[stat]; j++ ) {
                        chart[chart_index] += '#';
                    }
                    chart_index++;
                }
                skill_index++;
            }

            chart = chart.sort(function(a,b) { return b.length - a.length; });
            chart.forEach( function(element) {
              chart_output += element + '\n';
            });

            callback(formatResponse(chart_output));
        });
    }
};

/* return an array of equal-length strings
 *
 * @params    [object]   skill_obj   [ { skill : # of users } ]
 * @returns   [array]                [length-normalized strings]
*/
function paddedArray(skill_obj) {
    var max_length = 0,
        string_array = [],
        pad, skill, skill_stat, pad_length, i, j;

    // populate skills array, find longest skill name
    for ( var skill in skill_obj ) {
        if ( max_length < skill.length ) {
            max_length = skill.length;
        }
        string_array.push(skill);
    }

    // pad each skill in array to max_length characters
    for ( i = 0; i < string_array.length; i++ ) {
        skill_stat = skill_obj[string_array[i]];
        pad = '';
        pad_length = max_length - string_array[i].length;

        for ( j = 0; j < pad_length; j++ ) {
            pad += ' ';
        }
        string_array[i] += pad + ' ';

        // append the number of users per skill
        if ( skill_stat < 10 ) {
          string_array[i] += '( ' + skill_stat + ') ';
        }
        else {
          string_array[i] += '(' + skill_stat + ') ';
        }
    }
    return string_array;   
}

/* generate a Slack response histogram
 *
 * @params    [string]   output   [string-formatted histogram]
 * @returns   [object]            [Slack response]
*/
function formatResponse (output) {
    let data   = {
        'response_type': 'ephemeral',
        'attachments': [
            {
                'color'     : okColor,
                'title'     : '========================\n       Statistics       \n========================',
                'text'      : output,
                'mrkdwn_in' : ['text']
            }
        ]
    };
    return data;
}

function repopulateSkills() {
  // push all skills in DB through the data dictionary
}


