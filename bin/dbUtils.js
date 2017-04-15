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
    }
}
// function getAllSkills() {
//     Profiles
//         .find({}, 'skills')
//         .exec()
//         .then( (skills_obj) => {
//             var skill_list = [];
//             for (var skill_array in skills_obj) {
//                 skills_obj[skill_array].forEach( function(e) {
//                     if ( skill_list.indexOf(e) < 0 ) {
//                         skill_list.push(e);
//                     }
//                 });
//                 return skill_list.sort();
//             }
//         })
//         .catch( (err) => console.log('Error:', err));
// }

function getSkillList() {
  // return removeDuplicates(getAllSkills());
}

function countSkills() {
  // return count(getAllSkills());
}

function repopulateSkills() {
  // push all skills in DB through the data dictionary
}


