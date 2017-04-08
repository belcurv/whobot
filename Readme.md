```
           __      __ __          ___            __   
          /  \    /  \  |__   ____\_ |__   _____/  |_ 
          \   \/\/   /  |  \ /  _ \| __ \ /  _ \   __\
           \        /|   Y  (  <_> ) \_\ (  <_> )  |  
            \__/\  / |___|  /\____/|___  /\____/|__|  
                 \/       \/           \/         
```

=====================================================================

#### Aw, it’s a Slack Bot! (really just a /slash command)

Purpose: Whobot will "remember" attributes you give it to describe yourself. Whobot listens for a set of keywords in messages, and takes action accordingly:

```
Hi @user, I'm Whobot. I respond to the following commands:

/whobot I know {skill_1, skill_2}    // tell Whobot what you know
/whobot who is {@user_name}          // get a user's skills
/whobot who knows {skill}            // get all users with a skill
/whobot forget me                    // tell Whobot to forget you
```

Tech-stack
Slack API, Node.js, Heroku, a Mongo database
