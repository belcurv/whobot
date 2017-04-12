/* jshint esversion:6, node:true */

var skills = require('./dataDictionary');

/* return a standard skill if it exists
 * otherwise return the argument
 *
 * @params   [string]   request    [skill name]
 * @returns  [string]              [standard or original skill]
 */
module.exports = function (request) {
    var matchSkill = request;
    for (var skill in skills) {
        skills[skill].forEach(function (element) {
            if (request.toLowerCase() === element) {
                matchSkill = skill;
            }
        });
    }
    return matchSkill;
};
