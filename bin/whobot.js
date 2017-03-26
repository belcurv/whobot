/* bin/whobot.js */

/* jshint node: true */

module.exports = function (req, res, next) {
    
    // collect info from the POST
    var userName = req.body.user_name,
        postText = req.body.text;
        
    // our response
    var botPayload = {
        text: 'Hello, @' + userName + '! You wrote: "' + postText + '".'
    };
    
    // avoid infinite loop
    if (userName !== 'slackbot') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
    
};
