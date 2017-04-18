/* jshint esversion:6, node:true */

/*

  WTF is this? Just testing Heroku workers
  Based on: http://tinystride.com/notes/automate-stuff-on-a-server-with-a-dead-simple-node-worker/
  
  Goal: automate running of our stats utilities, emailing data to us via MailChimp API
  http://developer.mailchimp.com/documentation/mailchimp/

*/

const schedule = require('node-schedule'),
    dbUtils = require('./dbUtils'),

    // db
    db = require('../db'),
    mongoose = require('mongoose');

/* ============================= CONNECT TO DB ============================= */

mongoose.connect(db.getDbConnectionString());
mongoose.Promise = global.Promise;


/* ============================ UTILITY METHODS ============================ */

function buildTeamsList(data) {
    
    var seen = {};

    // de-dupelicate teams
    return data
        .map( (u) => u.team )
        .filter( (i) => seen.hasOwnProperty(i) ? false : (seen[i] = true) );

}


/* ============================== WORKER MAYBE ============================= */

var worker = {

    scheduleJob: function () {

        /* rules
         *
         * See http://stackoverflow.com/a/5398044/1252653
         *
         *   every minute:  * * * * *
         *   every midnight: 0 0 * * *
         *
         */
        var rule = '* * * * *';

        schedule.scheduleJob(rule, function () {

            console.log([
                '=========================================================',
                `Skill stats as of ${new Date()}`,
                '========================================================='
            ].join('\n'));


            dbUtils.getAllUsers(function (users) {

                var numUsers = users.length,
                    teams    = buildTeamsList(users);

                console.log(`Total teams: ${teams.length}`);
                console.log(`Teams: ${teams.join(', ')}`);

            });


            dbUtils.countSkills(function (results) {

                var keys = Object.keys(results),

                    arr = keys.map((key) => [key, results[key]])
                    .sort((a, b) => b[1] - a[1]);

                console.log(`\nSkills:\n - ${arr.join('\n - ')}`);

            });

        });

    },

    init: function () {

        this.scheduleJob();

    }

};

(function () {

    worker.init();

}());