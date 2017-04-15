/* jshint esversion:6, node: true */

/* Whobot Server
 * https://whobot.herokuapp.com/
 *
 * © 2017 Jay Schwane & Peter Martinson
*/

/* ================================= SETUP ================================= */
const express    = require('express'),
      app        = express(),
      path       = require('path'),
      port       = process.env.PORT || 3000,

      // middleware
      bodyParser = require('body-parser'),
      morgan     = require('morgan'),
      
      // db
      db         = require('./db'),
      mongoose   = require('mongoose'),
      
      // whobot
      whobot     = require('./bin/whobot'),
      
      // Slack auth
      slack      = require('./slack'),

      // Utilities
      dbUtils    = require('./bin/dbUtils');


/* ============================== MIDDLEWARE =============================== */

// logging
app.use(morgan('dev'));

// parse POST request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for serving static client app
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(400).send(err.message);
});


/* ============================= CONNECT TO DB ============================= */
mongoose.connect(db.getDbConnectionString());
mongoose.Promise = global.Promise;


/* ================================ ROUTES ================================= */

// return public landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Slack authentication route
app.get('/auth', slack);

// bot route
app.post('/whobot', whobot);

app.get('/skillz', (req, res) => {
    res.send(dbUtils.getAllSkills());
});

/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot server listening on port: ' + port);
});
