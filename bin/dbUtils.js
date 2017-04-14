/* jshint esversion:6, node:true */

const Profiles   = require('../models/profileModel'),
      fetchSkill = require('./fetchSkill');


function getAllSkills() {
    Profiles
        .find({}, 'skills')
        .exec()
        .then( (skills_obj) => {
            var skill_list = [];
            for (var skill_array in skills_obj) {
                skills_obj[skill_array].forEach( function(e) {
                    if ( skill_list.indexOf(e) < 0 ) {
                        skill_list.push(e);
                    }
                });
                return skill_list.sort();
            }
        })
        .catch( (err) => console.log('Error:', err));
}

console.log(getAllSkills());
