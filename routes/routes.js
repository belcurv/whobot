/* jshint node: true */

var bodyParser = require('body-parser'),
    Profiles   = require('../models/profileModel');


// get all profiles
// !! DEV ONLY - DISABLE FOR PRODUCTION !!
function getAllProfiles(req, res) {
    Profiles.find(function (err, profiles) {
        if (err) { throw err; }
        res.send(profiles);
    });
}


// get one profile by team_domain/user_name
function getOneProfile(req, res) {
    
    var target = {
        user_name: req.params.name,
        team_domain: req.params.team
    };
    
    Profiles.findOne(target, function (err, profile) {
        if (err) { throw err; }
        res.send(profile);
    });

}


// add a user profile
function addProfile(req, res) {
    var newProfile = Profiles(
        {
            team_id      : req.body.team_id,
            team_domain  : req.body.team_domain,
            channel_id   : req.body.channel_id,
            channel_name : req.body.channel_name,
            timestamp    : req.body.timestamp,
            user_id      : req.body.user_id,
            user_name    : req.body.user_name,
            attrs        : req.body.text
        }
    );

    newProfile.save(function (err) {
        if (err) { throw err; }
        res.send('Success - new profile saved');
    });
}


// delete a user profile
function deleteProfile(req, res) {
    
    var target = {
        user_name  : req.params.name,
        team_domain: req.params.team
    };
    
    Profiles.findOneAndRemove(target, function (err) {
        if (err) { throw err; }
        res.send('Success - profile deleted');
    });

}


module.exports = function(app) {
    
    // middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // API routes
    app.get('/api/profiles', getAllProfiles);
    app.get('/api/profiles/:team/:name', getOneProfile);
    app.delete('/api/profiles/:team/:name', deleteProfile);
    
};
