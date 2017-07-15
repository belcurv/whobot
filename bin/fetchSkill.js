/* jshint esversion:6, node:true */
/* Updated 15 Jul 2017 --
   Adds:
      'flattenDictionary' - private skill list flattening utility.
   Updates:
      Refactor syntax to be more es6y-y.
      Refactor 'fetchSkill' to work with new flattened dictionary
*/

const skills     = require('./dataDictionary');
const dictionary = flattenDictionary(skills);

/* =============================== utilities =============================== */

/* flattens the 2d skills dictionary
 *
 * @params   [object]   dict    [the 2d skills object]
 * @returns  [object]           [flattned & re-keyed skills map]
 */
function flattenDictionary(dict) {

    const result_obj = {};
    const dict_keys = Object.keys(dict);
    dict_keys.forEach( k => {
        dict[k].forEach( skill => {
            result_obj[skill] = k;
        });
    });
    return result_obj;
}


/* ============================ public methods ============================= */

/* return a standard skill if it exists
 * otherwise return the argument
 *
 * @params   [string]   request    [skill name]
 * @returns  [string]              [standard or original skill]
 */
function fetchSkill(request) {
    let matchSkill = request;
    if (dictionary.hasOwnProperty(request.toLowerCase())) {
      matchSkill = dictionary[request.toLowerCase()];
    }
    return matchSkill;
}


/* ================================ exports ================================ */

module.exports = fetchSkill;
