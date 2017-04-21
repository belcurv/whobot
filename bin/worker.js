/* jshint esversion:6, node:true */

const schedule = require('node-schedule'),
      dbUtils  = require('./dbUtils'),
      dotenv   = require('dotenv').config(),
      
      // nodemailer setup
      nodeMailer    = require('nodemailer'),
      smtpTransport = require('nodemailer-smtp-transport'),
      transporter   = nodeMailer.createTransport(smtpTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      })),
      
      // db
      db       = require('../db'),
      mongoose = require('mongoose');


/* ============================= CONNECT TO DB ============================= */

mongoose.connect(db.getDbConnectionString());
mongoose.Promise = global.Promise;


/* ============================ UTILITY METHODS ============================ */

/* Builds array of team objects
 *
 * @params    [object]   data   [raw database array of users]
 * @returns   [array]           [array team names & attributes]
*/
function buildTeamsList(data) {
    
    var seen  = {},
        teams = data
            .map( (u) => u.team )
            .filter( (i) => seen.hasOwnProperty(i) ? false : (seen[i] = true) )
            .map( (team) => {
        
                let userCount  = 0,
                    skillCount = 0;

                data.forEach( (u) => {

                    if (u.team === team) {
                        userCount += 1;
                        skillCount += u.skills.length;
                    }

                });

                return {
                    team_domain  : team,
                    total_users  : userCount,
                    total_skills : skillCount
                };
            });
    
    return teams;

}


/* Builds structured list of skills & counts
 *
 * @params    [object]   data   [raw database array of users]
 * @returns   [array]           [nested array of skill names & counts]
*/
function buildSkillsList(data) {
    
    var skillsTotals = {},
        allSkills = data
            .map( (el) => el.skills )
            .reduce( (acc, el) => acc.concat(el), [] );
    
    allSkills.forEach((skill) => {
        if (skillsTotals[skill] === undefined) {
            skillsTotals[skill] = 1;
        } else {
            skillsTotals[skill] += 1;
        }
    });
    
    return Object.keys(skillsTotals)
        .map( (key) => [key, skillsTotals[key]] )
        .sort( (a, b) => b[1] - a[1]);

}


/* Manage building of teams and skills lists
 *
 * @params    [object]   data   [raw database array of users]
 * @returns   [object]          [propertly structured object]
*/
function buildLists(data) {
    
    return {
        teams  : buildTeamsList(data),
        skills : buildSkillsList(data)
    };

}


/* Format message content sections
 *
 * @params    [object]   data   [object containing teams and skills lists]
 * @returns   [object]          [object of prepared html message content]
*/
function formatContent(data) {
    
    var header,
        teamsContent  = `<div style="background: #ddd; margin: 0; "><h4 style="margin-top: 0; margin-right: -1em; margin-bottom: .5em; margin-left: -1em; padding: .5em 1em; background-color: #08a; color: white; height: 1em; line-height: 1em;">Teams</h4><div style="padding-left: 1em;">`,
        
        skillsContent = `<div style="background: #ddd; margin: 0; "><h4 style="margin-top: 0; margin-right: -1em; margin-bottom: .5em; margin-left: -1em; padding: .5em 1em; background-color: #08a; color: white; height: 1em; line-height: 1em;">Skills</h4><div style="padding-left: 1em;">`,
        
        teams  = data.teams,
        skills = data.skills;
    
    header = `<h3 style="margin: 0; background-color: #333; color: white; height: 2em; line-height: 2em; text-align: center;">Skill stats as of ${(new Date()).toDateString()}</h3>`;
    
    // build teams section
    data.teams.forEach( (team) => {
        
        let message = [
            `<b>Team: ${team.team_domain}</b>`,
            'Team Members: ' + team.total_users,
            'Total Skills: ' + team.total_skills
        ].join('<br>');
        
        teamsContent += message + '<br><br>';
        
    });
    
    // build skills section
    data.skills.forEach( (skill) => {
        
        let message = `${skill[0]}: ${skill[1]}<br>`;
        skillsContent += message;
        
    });
    
    return {
        header        : header,
        teamsContent  : teamsContent,
        skillsContent : skillsContent
    };
}


/* Prepare and send the mail message
 *
 * @params   [object]   message   [formatted message content object]
*/
function sendMail(message) {
    
    let htmlBody = [
        `<div style="font-family: sans-serif;">`,
        message.header,
        message.teamsContent, '</div></div>',
        message.skillsContent, '</div></div>',
        '</div>'
    ].join('');

    let textBody = [
        message.header,
        message.teamsContent,
        message.skillsContent
    ].join('\n');

    transporter.sendMail({
        from    : 'whobot@belcurv.com',
        to      : 'jrschwane@uwalumni.com',
        cc      : ['peter.j.martinson@gmail.com', 'chinguftw@gmail.com'],
        subject : `Whobot Daily Stats - ${(new Date()).toDateString()}`,
        html    : htmlBody,
        text    : textBody
    });
    
}


/* ================================ WORKER ================================= */

var worker = {
    
    /* Collect chained operations together
     *   'dbUtils' from > bin/dbutils.js
     *   'getAllUsers()' returns a promise object
    */
    mailStuff: function() {
        
        dbUtils.getAllUsers()
            .then( buildLists )
            .then( formatContent )
            .then( sendMail );
    },


    /* Sets up the node-schedule scheduler
    */
    scheduleJob: function () {

        /* rules follow traditional cron syntax
         *
         * See http://stackoverflow.com/a/5398044/1252653
         *   every minute   : * * * * *
         *   every hour     : 0 * * * *
         *   every midnight : 0 0 * * *
         */
        var rule = '0 * * * *';

        schedule.scheduleJob(rule, function () {
            
            worker.mailStuff();

        });

    },

    /* main init method
    */
    init: function () {

        this.scheduleJob();

    }

};

(function () {
    
    worker.init();
//    worker.mailStuff();

}());
