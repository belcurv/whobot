/* bin/whobot.js */

/* jshint node: true, esversion:6 */

module.exports = function (req, res, next) {
    
    // collect info from the POST
    var userName = req.body.user_name,
        postText = req.body.text;
    
    // define container for our responses
    var botPayload = {};
    
    
    /* ========================== utility methods ========================== */
    
    function textCategory(text) {
        
        switch(text) {
                
            case 'who is':
                return 'get';
                
            case 'I know':
                return 'post';

            case 'forget me':
                return 'delete';
                
            default:
                return 'help';
        }
        
    }
    
    /* ======================== response generators ======================== */
    
    function helpResponse(you) {
        
        return `Hi @${you}, I'm *Whobot*. I respond to the following commands:
                \`\`\`
                /whobot who is @user_name               // fetch details for @user_name
                /whobot I know skill_1 skill_2 skill_3  // tell Whobot what you know
                /whobot forget me                       // tell Whobot to forget about you
                \`\`\``;
        
//        return [
//            `Hi @${you}, I'm *Whobot*. I respond to the following commands:`,
//            `\`/whobot who is @user_name}\` = fetch details for @user_name`,
//            `\`/whobot I know skill1 skill2 skill3 etc\` = tell Whobot what you know`,
//            `\`/whobot forget me\` = tell Whobot to forget about you`
//        ].join('\n');
    }
    
    
    /* ========================= response branches ========================= */
    
    // avoid infinite loop so the bot can't call itself
    if (userName !== 'slackbot') {
        
        switch(textCategory(postText)) {
                
            case 'get':
                // respond with a team member's profile
                botPayload.text = 'respond with a team member\'s profile';
                break;
                
            case 'post':
                // post user's profile to database
                botPayload.text = 'post user\'s profile to database';
                break;
                
            case 'delete':
                // delete user's profile from database
                botPayload.text = 'delete user\'s profile from database';
                break;
                
            default:
                // respond with help commands
                botPayload.text = helpResponse(userName);
        }

        return res.status(200).json(botPayload);

    } else {

        return res.status(200).end();
    
    }
    
};
