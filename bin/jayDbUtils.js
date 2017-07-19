/* jshint esversion:6, node:true */

const Profiles   = require('../models/profileModel'),
      fetchSkill = require('./fetchSkill');

const _stats = {
    update_count     : 0,
    updated_profiles : []
};


/* =============================== utilities =============================== */

/* get all user profiles in database
 * 
 * @params    [none]
 * @returns   [promise object]
*/
function getAllUsers() {
    return Profiles.find({})
        .exec()
        .then( (users) => {

            return users.map((u) => {
                return {
                    name    : u.user_name,
                    user_id : u.user_id,
                    team    : u.team_domain,
                    team_id : u.team_id,
                    skills  : u.skills
                };
            });
        });
}


/* deduplicate skills array
 *
 * @params    [array]   skills   [original skills array]
 * @returns   [array]            [de-duped skills array]
*/
function dedupeSkills(skills) {
    var seen = {};
    
    return skills
        .filter( (i) => seen.hasOwnProperty(i) ? false : (seen[i] = true) );
}


/* normalize skills using dictionary
 *
 * @params    [array]   skills   [a user's existing skills]
 * @returns   [array]            [normalized skills]
*/
function normalizeSkills(skills) {
    return skills.map ( orig_s => fetchSkill(orig_s));
}


/* check if two profiles have the same skills.
 *
 * @params    [object]   a   [subject profile #1]
 * @params    [object]   b   [subject profile #2]
 * @returns   [boolean]      [true if profiles are equal]
*/
function profilesAreEqual(a, b) {
    
    // if skills array lengths do not match, fail early
    if (a.skills.length !== b.skills.length) { return false; }
    
    // if skill array elements do not match, fail
    for (let i = 0; i < a.skills.length; i += 1) {
        if (a.skills[i] !== b.skills[i]) {return false; }
    }
    
    return true;
    
}


/* diff skills from two profiles
 * @params    [object]   a   [subject profile #1]
 * @params    [object]   b   [subject profile #2]
 * @returns   [array]        [strings of old --> new skills]
*/
function diffSkills(a, b) {
    
    const diff_map = [];
    
    for (let i = 0; i < a.skills.length; i += 1) {
        if (a.skills[i] !== b.skills[i]) {
            diff_map.push(`Old: ${a.skills[i]} --> New: ${b.skills[i]}`);
        }
    }
    
    return diff_map;
    
}


/* ============================ private methods ============================ */

/* rebuild profiles with normalized skills
 *
 * @params    [array]   profiles   [original input profiles]
 * @returns   [object]             [original and updated profiles arrays]
*/
function rebuildProfiles(profiles) {
    
    const updated = profiles.map( p => {
        
        return {
            name    : p.name,
            user_id : p.user_id,
            team    : p.team,
            team_id : p.team_id,
            skills  : normalizeSkills(p.skills)
        };
        
    });
    
    return {
        profiles,
        updated
    };
        
}


/* update _stats with changed profile info
 *
 * @params    [object]   data   [original and updated profiles arrays]
 * @returns   [object]          [same input object]
*/
function doStatistics(data) {
    
    // compare old and new profiles
    for (let i = 0; i < data.profiles.length; i += 1) {

        if (!profilesAreEqual(data.profiles[i], data.updated[i])) {
            
            // push profile name to list of updated profiles
            _stats.updated_profiles.push({
                name   : data.profiles[i].name,
                skills : diffSkills(data.profiles[i], data.updated[i])
            });
            
            // update private _stats.update_count
            _stats.update_count += 1;
        }
    }
    
    return data;
    
}


/* update profiles in database ## TO-DO ##
 *
 * @params    [object]   data   [original and updated profiles arrays]
 * @returns   [object]          [same input object]
*/
function updateDatabase(data) {
    
    // array of promises populated by the forEach loop
    const promiseList = [];
    
    // for each updated profile, query and update db record
    data.updated.forEach( profile => {
        
        // target profile with user's team ID and user ID
        const  user = {
            team_id: profile.team_id,
            user_id: profile.user_id
        };
        
        // for each updated profile, find and update their db record.
        // Each query is wrapped in a promise and pushed to 'promiseList'.
        promiseList.push( new Promise( resolve => {
            return Profiles
                .findOne(user)
                .exec()
                .then( (p) =>  {

                    // rebuild profile text property from updated skills
                    let newText   = `${(profile.skills).join(', ')}`,

                        // deduplicate profile skills before saving
                        newSkills = dedupeSkills(profile.skills);

                    // update profile's properties
                    p.postText = newText;
                    p.skills   = newSkills;

                    // save the updated profile
                    p.save( (err) => {
                        if (err) throw err;
                    });
                
                    // push `p` to `promiseList`
                    resolve(p);

                });
        }));
    });
    
    // resolve all promises in `promiseList` before returning.
    // Need to return to keep the promise chain rolling.
    return Promise.all(promiseList);
    
}


/* logging
*/
function logDump(data) {
    console.log('\n=============== Whobot DB Utils Stats ===============');
    console.log(`Number of Profiles Updated: ${_stats.update_count} of ${data.length}`);
    console.log(`Changes: ${_stats.updated_profiles.map( p => '\n' + p.name + '\n   ' + p.skills.join('\n   ')).join('\n')}`);
}


/* ============================= public methods ============================ */

function repopulateSkills() {
    getAllUsers()
        .then(rebuildProfiles)
        .then(doStatistics)
        .then(updateDatabase)
        .then(logDump);
}


/* ================================ exports ================================ */

module.exports = repopulateSkills;
