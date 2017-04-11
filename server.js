/* jshint esversion:6, node: true */

/* ================================= SETUP ================================= */
var express       = require('express'),
    app           = express(),
    path          = require('path'),
    request       = require('request'),
    dotenv        = require('dotenv').config(),
    port          = process.env.PORT || 3000,
    
    // middleware
    bodyParser    = require('body-parser'),
    morgan        = require('morgan'),
    
    // db
    config        = require('./config'),
    mongoose      = require('mongoose'),
    
    // whobot
    whobot        = require('./bin/whobot'),
    
    // slack config
    CLIENT_ID     = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET;


/* ============================== MIDDLEWARE =============================== */

// logging
app.use(morgan('dev'));

// parse POST request body
app.use(bodyParser.urlencoded({ extended: true }));

// for serving static client app
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(400).send(err.message);
});


/* ============================= CONNECT TO DB ============================= */
mongoose.connect(config.getDbConnectionString());
mongoose.Promise = global.Promise;



/* ================================ ROUTES ================================= */

// public site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Slack authentication
app.get('/auth', (req, res) => {
    // on oauth fail
    if (!req.query.code) {
        res.redirect('https://whobot.herokuapp.com/');
        return;
    }
    
    let oauthUrl = 'https://slack.com/api/oauth.access',
        data = {
            form: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: req.query.code,
                redirect_uri: 'https://whobot.herokuapp.com/auth'
            }
        };
    
    request.post(oauthUrl, data, (err, res, body) => {
        if (err) console.log('Oauth connectio error.');
        
        if (!err && res.statusCode === 200) {
            
            // get Auth token
            let teamUrl = 'https://slack.com/api/team.info',
                token   = JSON.parse(body).access_token;
            
            // redirect to team's Slack
            request.post(teamUrl, {form: {token: token}}, (err, res, body) => {
                if (!err && res.statuscode === 200) {
                    let team = JSON.parse(body).team.domain;
                    res.redirect(`http://${team}.slack.com`);
                }
            });
            
        }
    });
    
});

// bot route calls our whobot module
app.post('/whobot', whobot);



/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot listening on port: ' + port);
});
