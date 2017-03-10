/* jshint node: true */

var bodyParser = require('body-parser'),
    Profiles   = require('../models/profileModel');

module.exports = function(app) {
    
    // middleware to parse data from request body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    
    // get all profiles
    // !! DEV ONLY - DISABLE FOR PRODUCTION !!
    app.get('/api/profiles', function (req, res) {
        
        Profiles.find(function (err, profiles) {
            
            if (err) { throw err; }
            
            res.send(profiles);
            
        });
        
    });
    
    
    // get a profile by team_domain/user_name
    app.get('/api/profiles/:team/:name', function (req, res) {
        
        Profiles.findOne(
            {
                user_name: req.params.name,
                team_domain: req.params.team
            }, function (err, profile) {
            
            if (err) { throw err; }
            
            res.send(profile);
            
        });
        
    });
    
    
    // add a user profile
    app.post('/api/profiles', function (req, res) {
        
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
        
    });
    
    
    // delete a user profile
    app.delete('/api/profiles/:team/:name', function (req, res) {
        
        Profiles.findOneAndRemove(
            {
                user_name: req.params.name,
                team_domain: req.params.team
            }, function (err) {
                
                if (err) { throw err; }
                res.send('Success - profile deleted');
                
            });
        
    });
    
};
