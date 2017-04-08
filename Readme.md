```
           __      __ __          ___            __   
          /  \    /  \  |__   ____\_ |__   _____/  |_ 
          \   \/\/   /  |  \ /  _ \| __ \ /  _ \   __\
           \        /|   Y  (  <_> ) \_\ (  <_> )  |  
            \__/\  / |___|  /\____/|___  /\____/|__|  
                 \/       \/           \/         
```

### Aw, it’s a Slack Bot!

_(really just a /slash command)_

Purpose: Whobot will "remember" attributes you give it to describe yourself. Whobot listens for a set of keywords in messages, and takes action accordingly:

```
Hi @user, I'm Whobot. I respond to the following commands:

/whobot I know {skill_1, skill_2}    // tell Whobot what you know
/whobot who is {@user_name}          // get a user's skills
/whobot who knows {skill}            // get all users with a skill
/whobot forget me                    // tell Whobot to forget you
```

### Tech-stack

Slack API, Node.js, Heroku, a Mongo database

### Notes

[ngrok](https://www.npmjs.com/package/ngrok) is the business.

**Install:** `sudo npm install -g ngrok`

**Run:** `ngrok http 3000`

Then paste the `https` ngrok URL into the Slack slash command's request url here:

`https://api.slack.com/apps/A12345678/slash-commands`

_(Replace A12345678 with actual app id#)_

_(append `/whobot` to the ngrok URL)_