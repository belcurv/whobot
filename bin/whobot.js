/* bin/whobot.js */

/* jshint node: true */

module.exports = function (req, res, next) {
    var userName = req.body.user_name,
        botPayload = {
            text: 'Hello, ' + userName + '!'
        };
    
    // avoid infinite loop
    if (userName !== 'slackbot') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
    
};
