var vogels = require('vogels');
var Joi = require('joi');
var db = require('./models/database.js');
var SHA256 = require('crypto-js/sha256');
vogels.AWS.config.loadFromPath('credentials.json');

/*
SAMPLE DATA
*/

var users = [
  {user_id: 'nate', password: '1', name: 'nate r', email: 'nate@sample.com', affiliation: 'upenn'},
  {user_id: 'aaron', password: '2', name: 'aaron d', email: 'aaron@website.com', affiliation: 'philadelphia'},
  {user_id: 'will', password: '3', name: 'will w', email: 'will@example.com', affiliation: 'pennsylvania'},
]

var posts = [
  {post_id: '1', user_id: 'nate', data: "I am nate!", timestamp: 1},
  {post_id: '2', user_id: 'aaron', data: "I am aaron!", timestamp: 10},
  {post_id: '3', user_id: 'will', data: "I am will!", timestamp: 15},
]

var comments = [
  {post_id: '1', user_id: 'will', data: "Yo!", timestamp: 2},
  {post_id: '2', user_id: 'nate', data: "Hey!", timestamp: 11},
  {post_id: '3', user_id: 'aaron', data: "Hi!", timestamp: 16},
]

var friends = [
  {user_id: 'nate', friends: ['will']},
  {user_id: 'aaron', friends: ['will']},
  {user_id: 'will', friends: ['aaron', 'nate']},
]

var friend_recs = []
/*[
  {user_id: 'nate', friends: ['aaron']},
  {user_id: 'aaron', friends: ['nate']}
] */

var chats = [
  {chat_id: '1', user_ids: ['nate', 'will']},
  {chat_id: '2', user_ids: ['nate', 'aaron', 'will']},
]

var msgs = [
  {chat_id: '1', user_id: 'nate', data: 'Yo will.', timestamp: 10},
  {chat_id: '1', user_id: 'will', data: 'Yo Nate.', timestamp: 11},
  {chat_id: '1', user_id: 'nate', data: 'How are finals?', timestamp: 12},
  {chat_id: '2', user_id: 'aaron', data: 'This chat has all 3 of us.', timestamp: 10},
]

/*
SETUP AND FILL DATABASES
*/

setup();

async function setup() {
  console.log("\nPlease delete existing tables manually before running.\n");

  console.log("Creating tables (if they don't already exist) ...");
  await createTables();
  console.log("Adding users...");
  await setupUsers();
  console.log("Adding friends...");
  await setupFriends();
  console.log("Adding posts...");
  await setupPosts();
  console.log("Adding comments...");
  await setupComments();
  console.log("Adding chats...");
  await setupChats();
  console.log("Adding messages...");
  await setupMessages();
  console.log("Complete!");
}

/*
HELPER FUNCTIONS
*/

function createTables() {
  return new Promise(async function(resolve, reject) {
    vogels.createTables(async function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })
}

function setupUsers() {
  return new Promise(async function(resolve, reject) {
    for (const user of users) {
      var hashed_password = SHA256(user.password).toString();
      await db.addUser(user.user_id, hashed_password, user.name, user.email, user.affiliation);
    }
    resolve();
  });
}

function setupFriends() {
  return new Promise(async function(resolve, reject) {
    for (const user of friends) {
      for (const friend of user.friends) {
        await db.addFriend(user.user_id, friend);
      }
    }
    for (const user of friend_recs) {
      for (const friend of user.friends) {
        await db.addFriendRec(user.user_id, friend);
      }
    }
    resolve();
  });
}

function setupPosts() {
  return new Promise(async function(resolve, reject) {
    for (const post of posts) {
      await db.addPost(post.post_id, post.user_id, post.data, post.timestamp);
    }
    resolve();
  });
}

function setupComments() {
  return new Promise(async function(resolve, reject) {
    for (const comment of comments) {
      await db.addComment(comment.post_id, comment.user_id, comment.data, comment.timestamp);
    }
    resolve();
  });
}


function setupChats() {
  return new Promise(async function(resolve, reject) {
    for (const chat of chats) {
      await db.addChat(chat.chat_id, chat.user_ids);
    }
    resolve();
  });
}

function setupMessages() {
  return new Promise(async function(resolve, reject) {
    for (const msg of msgs) {
      await db.addMessage(msg.chat_id, msg.user_id, msg.data, msg.timestamp);
    }
    resolve();
  });
}
