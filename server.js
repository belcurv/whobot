/* jshint esversion:6, node: true */

/* ================================= SETUP ================================= */
var express    = require('express'),
    app        = express(),
    path       = require('path'),
    
    // middleware
    bodyParser = require('body-parser'),
    morgan     = require('morgan'),
    
    // db
    config     = require('./config'),
    mongoose   = require('mongoose'),

    // port assignment
    port       = process.env.PORT || 3000,
    
    // whobot
    whobot     = require('./bin/whobot');


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

// bot route calls our whobot module
app.post('/whobot', whobot);


/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot listening on port: ' + port);
});
