/* jshint esversion:6, node: true */

/* ================================= setup ================================= */

const request       = require('request'),
      dotenv        = require('dotenv').config(),
      CLIENT_ID     = process.env.CLIENT_ID,
      CLIENT_SECRET = process.env.CLIENT_SECRET;


/* ================================= route ================================= */

function authRouteHandler(req, res) {
    
    // on oauth fail
    if (!req.query.code) {
        res.redirect('https://whobot.herokuapp.com/');
        return;
    }

    let authUrl = 'https://slack.com/api/oauth.access',
        data    = {
            form: {
                client_id     : CLIENT_ID,
                client_secret : CLIENT_SECRET,
                code          : req.query.code
            }
        };

    request.post(authUrl, data, (error, response, body) => {

        if (!error && response.statusCode === 200) {

            // get Auth token
            let teamUrl = 'https://slack.com/api/team.info',
                token   = JSON.parse(body).access_token;

            // redirect to team's Slack after auth
            request.post(teamUrl, {form: {token: token} }, (err, rsp, bdy) => {
                
                // if all ok, proceed
                if (!err && rsp.statusCode === 200) {

                    if (JSON.parse(bdy).error == 'missing_scope') {
                        res.send('Whobot added to your team!');
                    } else {
                        let team = JSON.parse(bdy).team.domain;
                        res.redirect(`http://${team}.slack.com`);
                    }
                    
                }
            });

        } else {
            console.log('Error:', error);
        }

    });

}


/* ================================ exports ================================ */

module.exports = authRouteHandler;
