/* jshint node: true */

/* ================================= SETUP ================================= */
var express    = require('express'),
    app        = express(),
    
    // middleware
    bodyParser = require('body-parser'),
    morgan     = require('morgan'),
    
    // db
//    config     = require('./config'),
//    mongoose   = require('mongoose'),

    // port assignment
    port       = process.env.PORT || 3000,
    
    // whobot
    whobot     = require('./bin/whobot');


/* ============================== MIDDLEWARE =============================== */

// logging
app.use(morgan('dev'));

// parse POST request body
app.use(bodyParser.urlencoded({ extended: true }));

// error handler
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(400).send(err.message);
});


/* ============================= CONNECT TO DB ============================= */
//mongoose.connect(config.getDbConnectionString());



/* ================================ ROUTES ================================= */

// test route
app.get('/', function (req, res) {
    res.status(200).send('Hello from Whobot!');
});

// bot route calls our whobot module
app.post('/whobot', whobot);


/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot listening on port: ' + port);
});
