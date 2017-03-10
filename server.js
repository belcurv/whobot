/* jshint node: true */

/* ================================= SETUP ================================= */
var express    = require('express'),
    app        = express(),
    
    // middleware
    bodyParser = require('body-parser'),
    morgan     = require('morgan'),
    
    // db
    config     = require('./config'),
    mongoose   = require('mongoose'),

    // routes
    apiRoutes  = require('./routes/routes.js')(app),
    setupRoute = require('./routes/setup.js')(app),
    
    // port assignment
    port       = process.env.PORT || 3000;
    
    // deprecated?
    // whobot     = require('./bin/whobot'),


/* ============================== MIDDLEWARE =============================== */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));  // logging


/* ============================= CONNECT TO DB ============================= */
mongoose.connect(config.getDbConnectionString());


/* ============================= START SERVER ============================== */
app.listen(port, function () {
    console.log('Whobot listening on port: ' + port);
});
