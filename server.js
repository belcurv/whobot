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
      slack      = require('./slack');

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
    console.log('Error: ', err.stack);
    res.status(500).send('Something broke...');
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

/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot server listening on port: ' + port);
});
