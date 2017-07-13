/* jshint esversion:6, node:true */

const dictionary = require('./dataDictionary_2');

/* return a standard skill if it exists
 * otherwise return the argument
 *
 * @params   [string]   request    [skill name]
 * @returns  [string]              [standard or original skill]
 */
// module.exports = function (request) {
let test_skills = ['javascript','react','ejs','vue'];

let fetchSkill =  function (request) {
    let matchSkill = request;
    if (dictionary.hasOwnProperty(request.toLowerCase())) {
      matchSkill = dictionary[request.toLowerCase()];
    }

    // for (var skill in skills) {
    //     skills[skill].forEach(function (element) {
    //         if (request.toLowerCase() === element) {
    //             matchSkill = skill;
    //         }
    //     });
    // }
    return matchSkill;
};

for (let i = 0; i < test_skills.length; i++) {
  console.log(test_skills[i] + ' -> ' + fetchSkill(test_skills[i]));
}
