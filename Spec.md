
## SETUP

After downloading the repo, and navigating into the folder, run `npm install;` in your terminal. Then create an empty file called `credentials.json` file and add your AWS credentials in this format:

```
{
  "accessKeyId": "xxx",
  "secretAccessKey": "xxx",
  "region": "us-east-1"
}
```

To create sample database tables, then run `node loader.js`. If you have already created these tables and want to remove previous data, you will have to delete them manually.

## RUNNING ADSORPTION

Copy the `credentials.json` file into the adsorption folder. Then, in the adsorption folder, run the command `. run`. Friend recommendations will be created and uploaded to the database.


## SPECIFICATION:

### Features:


1. Signup Page:
  * Routes: /signup, /addaccount, /login
  * Allows a user to create a new account, with a user id, a password, and their full name, email, and affiliation. Also, a link to the login page, in case they already have an account.
2. Login Page
  * Routes: /login, /checklogin, /signup
  * Allows a user to input their user id and password to login. Link to signup page, if they don't have account.
3. News-feed Page:
  * Routes: /newsfeed, /addlike, /addcomment, /addpost, /getfeed, /getpost
  * Shows users default "newsfeed," like facebook news feed, and allows them to interact with it.
3. User Homepage:
  * Routes: /profile, /newsfeed, /addprofiledata
  * Shows the profile of some specific user
4. Chat:
  * Routes: /chat, /addchat, /addmessage, /getuserchats, /getchatusers, /getchat, /leavechat, /addusertochat
  * Allows user to chat with their friends

## Helpful Datatypes:

The `message` data type is a JSON object with 3 fields:
- user_id : String
- data : String
- timestamp : Timestamp

We use the `message` data type as the base type for posts, post comments, and chat messages.

### Routes:

* /signup:
  * GET ROUTE
  * Params:
  * Response: renders signup page
* /addaccount:
  * POST
  * Params:
    * user_id
    * hashed_password
    * name
    * email
    * affiliation
  * Response:
    * {success: true} if account created. {success: false, error: 'INSERT ERROR HERE'} if creation fails. Saves user session. If success, client side javascript should redirect to /newsfeed. If failure, stays on /signup page, and displays error.
* /login:
  * GET ROUTE
  * Params:
  * Response: renders login page
* /checklogin:
  * POST ROUTE
  * Params:
    * user_id
    * hashed_password
  * Response:
    * {success: true} if login successful. {success: false, error: 'INSERT ERROR HERE'} if login fails. Saves user ID in session. If success, client side JS should redirect to /newsfeed. If failure, should stay on /login page, and displays error.
* /addlike:
  * POST ROUTE
  * Params:
    * user_id [liker]
    * post_id
  * Response:
    * {success: true} if like successful. {success: false, error: 'INSERT ERROR HERE'} if like fails. Client side javascript should make like button "be liked"
* /newsfeed:
  * GET ROUTE
  * Params:
  * Response: {success: true, posts: [post_id]} if successful. {success: false} otherwise. Client side should then perform calls to get these posts, and then display them.
* /addcomment: -- come here
  * POST ROUTE
  * Params:
    * user_id [liker]
    * post_id
    * data
  * Response:
    * {success: true} if comment successful. {success: false, error: 'INSERT ERROR HERE'} if comment fails. If success, client-side js should display comment. If failure, displays error.
* /addpost:
  * POST ROUTE
  * Params:
    * user_id [poster]
    * data
  * Response:
    * {success: true, post_id: post_id} if post successful. {success: false, error: "INSERT ERROR HERE"} if post fails. If sucess client side, add post to top of timeline
* /getfeed:
  * GET ROUTES
  * Params:
    * user_id
  * Response:
    * {success: true, posts: [post_id]} if successful. {success: false, error: "INSERT ERROR HERE"} if unsucessful.
* /getpost:
  * GET ROUTES
  * Params:
    * post_id
  * Response:
    * {success: true, post_id: post_id, post_data: `message`, comments: [`message`], likes: [user_id]} if successful. {success: false, error: "INSERT ERROR HERE"} if unsucessful.
* /getuserchats
  * GET ROUTES
  * Params:
    * user_id
  * Response:
    * {success: true, chat: [chat_id]} if successful.  {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /getchatusers
  * GET ROUTE
  * Params:
    * chat_id
  * Response:
    * {success: true, users: [user_id]} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /getchat
  * GET ROUTE
  * Params:
    * chat_id
  * Response:
    * {success: true, chat_id: chat_id, users: [user_id], messages: [`message`]} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /addchat
  * POST ROUTE
  * Params:
    * users: [user_ids]
  * Response:
    * {success: true, chat_id: chat_id} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /addmessage
  * POST ROUTE
  * Params:
    * user_id
    * chat_id
    * data
  * Response:
    * {success: true} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /leavechat
  * POST ROUTE
  * Params:
    * user_id
    * chat_id
  * Response:
    * {success: true} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /addusertochat
  * POST ROUTE
  * Params:
    * user_id
    * chat_id
  * Response:
    * {success: true} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.
* /addfriend
  * POST ROUTE
  * Params:
    * user_id
    * friend_id
  * Response:
    * {success: true} if successful. {success: false, error: "INSERT ERROR HERE"} if unsuccessful.


### Database Schema:


1. User
  * Key:
    * user_id : String
  * Values:
    * hashed_password : String
    * name : String
    * email : String
    * affiliation : String
    * posts: String Set (post_ids)
    * chats: String Set [JSON Objects]
      * chat_id : String
      * in_chat : Boolean (false if user has left chat)
    * online: Boolean (true if the user is currently logged in)
    * friends : String Set (user_ids)
2. Post
  * Key:
    * post_id : String
  * Value:
    * `message`
    * comments : String Set [JSON Object]
      * `message`
    * likes: String Set [user_id]
3. Chat
  * Key:
    * chat_id : String
  * Value:
    * users : String Set [user_ids - only the users that are current active]
    * comments: String Set [JSON Objects]
      * `message`

### Map Reduce:

* Starting Format:
-

* Iteration Format:

* Finish Format:
