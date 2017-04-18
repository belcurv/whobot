/* jshint esversion:6, node:true */

const Profiles   = require('../models/profileModel'),
      fetchSkill = require('./fetchSkill');


module.exports = {
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

    getSkillList : function(callback) {
        var unique_skill_list = [];
        this.getAllSkills( (full_skill_list) => {
            full_skill_list.forEach( (skill) => {
                if ( unique_skill_list.indexOf(skill) < 0 ) {
                    unique_skill_list.push(skill);
                }
            });
            callback(unique_skill_list.sort());
        });
    },

    countSkills : function(callback) {
        var skill_tally = {};
        this.getAllSkills( (full_skill_list) => {
            full_skill_list.forEach( (skill) => {
                if ( skill_tally[skill] === undefined ) {
                    skill_tally[skill] = 1;
                }
                else {
                    skill_tally[skill] += 1;
                }
            });
            callback(skill_tally);
        });            
    },

    paddedArray : function(skill_obj) {
        var max_length = 0,
            string_array = [],
            pad, skill, pad_length, i, j;

        // populate skills array, find longest skill name
        for ( skill in skills ) {
            if ( max_length < skill.length ) {
                max_length = skill.length;
            }
            string_array.push(skill);
        }

        // pad each skill in array to max_length characters
        for ( i = 0; i < string_array.length; i++ ) {
            pad = '';
            pad_length = max_length - string_array[i].length;
            for ( j = 0; j < pad_length; j++ ) {
                pad += ' ';
            }
            string_array[i] += pad + ' ';
        }

        return string_array;   
    },

    chartSkills : function(callback) {
        var skill_index = chart_index = 0,
            chart = [],
            stat, j,
            padded_skills;

        countSkills( function(skill_obj) {
            padded_skills = padded_array(skill_obj);
            for ( stat in skill_obj ) {
                if ( skill_obj[stat] ) {
                    chart.push(padded_skills[skill_index]);
                    chart[chart_index] += ': ';
                    for ( j = 0; j < skill_obj[stat]; j++ ) {
                        chart[chart_index] += '#';
                    }
                    // chart[chart_index] += ' (' + skill_obj[stat] + ')'
                    chart_index++;
                }
                skill_index++;
            }
            callback(chart);
        });
    }
};


function repopulateSkills() {
  // push all skills in DB through the data dictionary
}


