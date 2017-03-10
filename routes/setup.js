/* jshint node: true */

/* This is only used to pre-populate the database during development.
   Sending a http GET request to '/api/setupProfiles'
   will push the 'dummyProfiles' array to our database.
*/

var Profiles = require('../models/profileModel');

module.exports = function (app) {
    
    app.get('/api/setupProfiles', function (req, res) {
        
        // dummy profiles
        var dummyProfiles = [
            {
                team_id      : '123456',
                team_domain  : 'ChinguMeerkats',
                channel_id   : 'C123456',
                channel_name : 'intro-about-me',
                timestamp    : '1355517523.000005',
                user_id      : 'U123456',
                user_name    : 'Steve',
                attrs        : 'javascript, php, python, pizza'
            },
            {
                team_id      : '789101112',
                team_domain  : 'ChinguLions',
                channel_id   : 'C789101112',
                channel_name : 'intro-about-me',
                timestamp    : '1355517523.000005',
                user_id      : 'U789101112',
                user_name    : 'Bert',
                attrs        : 'bash, powershell, bassoon'
            },
            {
                team_id      : '098765',
                team_domain  : 'ChinguPenguins',
                channel_id   : 'C098765',
                channel_name : 'intro-about-me',
                timestamp    : '1355517523.000005',
                user_id      : 'U098765',
                user_name    : 'Ernie',
                attrs        : 'ruby, rails, C#, calisthenics'
            }
        ];
        
        // seed database with dummies
        Profiles.create(dummyProfiles, function (err, results) {
            
            res.send(results);
            
        });
        
    });
    
};
