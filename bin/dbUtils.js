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
        this.getAllSkills( (full_skill_list) => {
            var unique_skill_list = [];
            full_skill_list.forEach( (skill) => {
                if ( unique_skill_list.indexOf(skill) < 0 ) {
                    unique_skill_list.push(skill);
                }
            });
            callback(unique_skill_list.sort());
        });
    }

}

function countSkills() {
  // return count(getAllSkills());
}

function repopulateSkills() {
  // push all skills in DB through the data dictionary
}


