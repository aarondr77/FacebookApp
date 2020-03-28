var vogels = require('vogels');
var Joi = require('joi');
vogels.AWS.config.loadFromPath('credentials.json');

/*
 DEFINE AND SAVE DATABASE SCHEMA
*/

var User = vogels.define('User', {
 hashKey: 'user_id',
 schema: {
   user_id: Joi.string(),
   hashed_password: Joi.string(),
   name: Joi.string(),
   email: Joi.string().email(),
   affiliation: Joi.string(),
   posts: vogels.types.stringSet(),
   chats: vogels.types.stringSet(),
   chats: vogels.types.stringSet(),
   online: Joi.boolean(),
   friends: vogels.types.stringSet(),
   friend_recs: vogels.types.stringSet(),
 },
 tableName: 'users',
});

var Post = vogels.define('Post', {
 hashKey: 'post_id',
 schema: {
   post_id: Joi.string(),
   user_id: Joi.string(),
   data: Joi.string(),
   timestamp: Joi.date().timestamp(),
   comments: vogels.types.stringSet(),
   likes: vogels.types.stringSet(),
 },
 tableName: 'posts',
});

var Chat = vogels.define('Chat', {
 hashKey: 'chat_id',
 schema: {
   chat_id: Joi.string(),
   messages: vogels.types.stringSet(),
   users: vogels.types.stringSet(),
 },
 tableName: 'chats',
});

var Affiliation = vogels.define('affiliation', {
 hashKey: 'affiliation',
 schema: {
   affiliation: Joi.string(),
   users: vogels.types.stringSet(),
 },
 tableName: 'affiliations',
});


/*
 HELPER FUNCTIONS
*/

function exists(db, id) {
  return new Promise(function(resolve, reject) {
    db.get(id, function(err, data) {
      if (data) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
  })
}

function update(db, update) {
  // Invariant: only call if id exists
  return new Promise(function(resolve, reject) {
    db.update(update, function(err, data) {
      if (data) {
        resolve(data.attrs);
      } else {
        reject("Error updating: " + err);
      }
    });
  });
}

/*
 USER DATABASE INTERACTIONS
*/

function getUser(user_id) {
  return new Promise(function(resolve, reject) {
    User.get(user_id, function(err, acc) {
      if (acc) {
        resolve(acc.attrs);
      } else if (err) {
        reject("Error getting user: " + err);
      } else {
        reject("Error getting user: user does not exist");
      }
    });
  })
}


function addUser(user_id, hashed_password, name, email, affiliation) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (uExists) return reject("Error adding user: user already exists");

    // User starts with no chats and no posts
    var userData = {
      user_id: user_id,
      hashed_password: hashed_password,
      name: name,
      email: email
    };

    User.create(userData, async function(err, acc) {
      if (acc) {
        await changeAffiliation(user_id, affiliation);
        resolve(acc.attrs);
      } else {
        reject("Error adding user: " + err);
      }
    });
  });
}


function addFriend(user_id, friend_id) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    let fExists = await exists(User, friend_id);
    if (!uExists || !fExists) return reject("Error adding friend: friend or user does not exist");

    var userUpdate = {user_id: user_id, friends: {$add: friend_id}, friend_recs: {$del: friend_id}};
    var friendUpdate = {user_id: friend_id, friends: {$add: user_id}, friend_recs: {$del: user_id}};

    try {
      await update(User, userUpdate);
      await update(User, friendUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function addFriendRec(user_id, friend_id) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    let fExists = await exists(User, friend_id);
    if (!uExists || !fExists) return reject("Error adding friend rec: friend or user does not exist");

    // first, we check if they are already friends
    var user = await getUser(user_id);

    // only called when the server is not running, so performance not a concern
    var alreadyFriends = false;
    user.friends.forEach(friend => {
      if (friend === friend_id) alreadyFriends = true;
    })

    if (alreadyFriends) {
      return reject("Error adding friend rec: already friends");
    }

    // otherwise, we add a friend reccomendation
    var userUpdate = {user_id: user_id, friend_recs: {$add: friend_id}};

    try {
      await update(User, userUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

/*
 POSTS DATABASE INTERACTIONS
*/

function getPost(post_id) {
  return new Promise(async function(resolve, reject) {
    Post.get(post_id, function(err, post) {
      if (post) {
        resolve(post.attrs);
      } else if (err) {
        reject("Error getting post: " + err);
      } else {
        reject("Error getting post: post does not exist");
      }
    });
  });
}


function addPost(post_id, user_id, data, timestamp) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error adding post: user does not exist");
    let pExists = await exists(Post, post_id);
    if (pExists) return reject("Error adding post: post already exists");

    // Post starts with no comments
    var postData = {
      post_id: post_id,
      user_id: user_id,
      data: data,
      timestamp: timestamp
    };

    try {
      Post.create(postData, async function(err, post) {
        if (post) {
          var userUpdate = {user_id: user_id, posts: {$add: post_id}};
          await update(User, userUpdate);
          resolve(post.attrs);
        } else {
          reject("Error creating post: " + err);
        }
      })
    } catch (err) {
      reject(err);
    }
  });
}


function addComment(post_id, user_id, data, timestamp) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error adding comment: user does not exist");
    let pExists = await exists(Post, post_id);
    if (!pExists) return reject("Error adding comment: post does not exist");

    try {
      var commentData = JSON.stringify({
        user_id: user_id,
        data: data,
        timestamp: timestamp
      });
      var postUpdate = {post_id: post_id, comments: {$add: commentData}};
      await update(Post, postUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}


function addLike(post_id, user_id) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error adding like: user does not exist");
    let pExists = await exists(Post, post_id);
    if (!pExists) return reject("Error adding like: post does not exist");

    try {
      var likeData = JSON.stringify({user_id: user_id});
      var postUpdate = {post_id: post_id, likes: {$add: likeData}};
      await update(Post, postUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

/*
 CHAT DATABASE INTERACTIONS
*/

function getChat(chat_id) {
  return new Promise(async function(resolve, reject) {
    Chat.get(chat_id, function(err, chat) {
      if (chat) {
        resolve(chat.attrs);
      } else if (err) {
        reject("Error getting chat: " + err);
      } else {
        reject("Error getting chat: chat does not exist");
      }
    });
  });
}


function addUserToChat(chat_id, user_id) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error adding user to chat: user does not exist");
    let cExists = await exists(Chat, chat_id);
    if (!cExists) return reject("Error adding user to chat: chat does not exist");

    try {
      var userUpdate = {user_id: user_id, chats: {$add: JSON.stringify({chat_id: chat_id, in_chat: true})}};
      await update(User, userUpdate);
      var chatUpdate = {chat_id: chat_id, users: {$add: user_id}};
      await update(Chat, chatUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function removeUserFromChat(chat_id, user_id) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error removing user from chat: user does not exist");
    let cExists = await exists(Chat, chat_id);
    if (!cExists) return reject("Error removing user from chat: chat does not exist");

    try {
      var userUpdate = {user_id: user_id, chats: {$del: JSON.stringify({chat_id: chat_id, in_chat: true})}};
      await update(User, userUpdate);
      var chatUpdate = {chat_id: chat_id, users: {$del: user_id}};
      await update(Chat, chatUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}


function addChat(chat_id, users) {
  return new Promise(async function(resolve, reject) {
    let cExists = await exists(Chat, chat_id);
    if (cExists) return reject("Error creating chat: chat already exists");

    for (const user of users) {
      var uExists = await exists(User, user);
      if (!uExists) return reject("Error creating chat: user does not exist");
    }

    try {
      Chat.create({chat_id: chat_id}, async function(err, chat) {
        for (const user of users) {
          await addUserToChat(chat_id, user);
        }
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  });
}


function addMessage(chat_id, user_id, data, timestamp) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error adding message: user does not exist");
    let cExists = await exists(Chat, chat_id);
    if (!cExists) return reject("Error adding message: chat does not exist");

    try {
      var messageData = JSON.stringify({user_id: user_id, data: data, timestamp: timestamp});
      var chatUpdate = {chat_id: chat_id, messages: {$add: messageData}};
      await update(Chat, chatUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

/*
 Affiliation
*/

function changeAffiliation(user_id, affiliation) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error changing affiliation: user does not exist");
    let user = await getUser(user_id);
    var oldAff = user.affiliation;

    try {
      var userUpdate = {user_id: user_id, affiliation: affiliation};
      await update(User, userUpdate);
      var affiliationUpdate = {affiliation: affiliation, users: {$add: user_id}};
      var affiliationRemove = {affiliation: oldAff, users: {$del: user_id}};
      await update(Affiliation, affiliationUpdate);
      await update(Affiliation, affiliationRemove);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function changeName(user_id, name) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error changing name: user does not exist");

    try {
      var userUpdate = {user_id: user_id, name: name};
      await update(User, userUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function changeEmail(user_id, email) {
  return new Promise(async function(resolve, reject) {
    let uExists = await exists(User, user_id);
    if (!uExists) return reject("Error changing email: user does not exist");

    try {
      var userUpdate = {user_id: user_id, email: email};
      await update(User, userUpdate);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function getUsersWithAffiliation(affiliation) {
  return new Promise(async function(resolve, reject) {
    Affiliation.get(affiliation, function(err, affil) {
      if (affil) {
        resolve(affil.attrs.users);
      } else if (err) {
        reject("Error getting affiliation: " + err);
      } else {
        reject("Error getting affiliation: affiliation does not exist");
      }
    });
  });
}


function getUsersWithPrefix(prefix) {
  return new Promise(async function(resolve, reject) {
    User.scan().where('name').beginsWith(prefix).exec(function (err, data) {
      if (data) {
        var users = data.Items.map(x => x.attrs.user_id);
        resolve(users);
      } else if (err) {
        reject([]);
      } else {
        resolve([]);
      }
    });
  });
}

/*
  INTERNAL FUNCTIONS
*/

// Helper function

function internalScanDB(db) {
  return new Promise(async function(resolve, reject) {
    db.scan().exec(function (err, data) {
      if (data) {
        data = data.Items.map(x => x.attrs);
        resolve(data);
      } else if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

var database = {
  userDB: User,
  postDB: Post,
  chatDB: Chat,
  affilDB: Affiliation,
  getUser: getUser,
  addUser: addUser,
  getPost: getPost,
  addPost: addPost,
  addFriend: addFriend,
  addFriendRec: addFriendRec,
  addLike: addLike,
  addComment: addComment,
  getChat: getChat,
  addChat: addChat,
  addUserToChat: addUserToChat,
  removeUserFromChat: removeUserFromChat,
  addMessage: addMessage,
  changeAffiliation: changeAffiliation,
  changeName: changeName,
  changeEmail: changeEmail,
  getUsersWithAffiliation: getUsersWithAffiliation,
  getUsersWithPrefix: getUsersWithPrefix,
  internalScanDB: internalScanDB
};

module.exports = database;
