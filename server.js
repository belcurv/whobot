/* server.js */

/* jshint node: true */

/* ================================= SETUP ================================= */
var express    = require('express'),
    bodyParser = require('body-parser'),
    whobot     = require('./bin/whobot'),
    app        = express(),
    port       = process.env.PORT || 3000;


/* ============================== MIDDLEWARE =============================== */

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
});


/* ================================ ROUTES ================================= */

// test route
app.get('/', function (req, res) {
    res.status(200).send('Hello from Whobot!');
});


// testing whobot
app.post('/whobot', whobot);



/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot listening on port: ' + port);
});
