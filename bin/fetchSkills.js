/* jshint esversion:6, node:true */

var skills = require('./dataDictionary');

module.exports = function(request) {
  let skill = '';
  for ( skill in skills ) {
    skill.forEach(function(element) {
      if ( request.toLowerCase() === element ) {
        return skill;
      }
    });
  }
  return null;
};
