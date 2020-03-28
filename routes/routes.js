var db = require('../models/database.js');
var async = require('async');
var vogels = require('vogels');
vogels.AWS.config.loadFromPath('credentials.json');
var currentRoom;

function getTime() {
  return (new Date()).getTime();
}

function getCurrentUser(req, res) {
  var currentUser = {
    currentUser: req.session.user_id
  };
  res.json(currentUser);
}

function newID() {
  return Math.random().toString(36).substr(2, 9);
}

var chat = function (req, res) {
  res.render('chatbox.ejs');
}

function signup(req, res) {
  res.render('signup.ejs');
}

function friendvisualizer (req, res) {
	res.render('friendvisualizer.ejs');
}

async function addAccount(req, res) {
  var user_id = req.body.user_id;
  var hashed_password = req.body.hashed_password;
  var name = req.body.name;
  var email = req.body.email;
  var affiliation = req.body.affiliation;

  try {
    await db.addUser(user_id, hashed_password, name, email, affiliation);
    req.session.user_id = user_id;
    req.session.save();
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

function login(req, res) {
  res.render('login.ejs', {message: ''});
}

async function checkLogin(req, res) {
  var user_id = req.body.user_id;
  var hashed_password = req.body.hashed_password;
  try {
    var data = await db.getUser(user_id);
    if (data.hashed_password == hashed_password) {
      req.session.user_id = user_id;
      req.session.save();
      res.json({success: true});
      res.redirect('/homepage');
    } else {
      res.json({success: false, error: "Incorrect password"});
    }
  } catch (err) {
    res.json({success: false, error: err});
  }
}

//WW
function logout(req, res) {
	req.session.user_id = '';
	res.redirect('/');
}

function init(req, res) {
	res.render('login.ejs', {message: ''});
}

function homepage(req, res) {
	if (req.session.user_id == null) {
		res.redirect('/');
	} else {
    res.render('homepage.ejs', {profile: req.session.user_id, currentUser: req.session.user_id});
	}
}

async function getUserData(req, res) {
	var user_id = req.query.user;

  try {
    var profile_data = await db.getUser(user_id);
    res.json({
      success: true,
      name: profile_data.name,
      email: profile_data.email,
      affiliation: profile_data.affiliation,
      posts: profile_data.posts,
      friends: profile_data.friends,
      friend_recs: profile_data.friend_recs
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function getUserPosts(req, res) {
	var user_id = req.query.user_id;

  try {
    var data = await db.getUser(user_id);
    if (data.posts != null) {
      data.posts.sort(async function(a, b) {
        let postA = await db.getPost(a);
        let postB = await db.getPost(b);
        var keyA = new Date(postA.timestamp);
        var keyB = new Date(postB.timestamp);
        if(keyA < keyB) return 1;
        if(keyA > keyB) return -1;
        return 0;
    });
  }
    res.json({
      success: true,
      name: data.name,
      email: data.email,
      affiliation: data.affiliation,
      posts: data.posts
    });
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function getPostComments(req, res) {
	var post_id = req.query.post_id;

  try {
    var data = await db.getPost(post_id);

    res.json({
      success: true,
      text: data.data,
      comments: data.comments,
      timestamp: data.timestamp,
      post_id: data.post_id,
      likes: data.likes,
      user_id: data.user_id
    });
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function searchUser(req, res) {
  var user_id = req.body.user;

  try {
    var data = await db.getUser(user_id);
    res.render('homepage.ejs', {currentUser: req.session.user_id, profile: data.user_id});
  } catch (err) {
    res.render('homepage.ejs', {currentUser: req.session.user_id, profile: req.session.user_id})
  }
}

async function newsFeed(req, res) {
  if (req.session.user_id == null) {
		res.redirect('/');
	} else {
    res.render('newsfeed.ejs', {profile: req.session.user_id});
  }
}

async function getFeed(req, res) {
  var user_id = req.query.user_id;

  try {
    var user = await db.getUser(user_id);
    var friends = user.friends;
    var posts = [].concat(user.posts);
    for (const friend_id of friends) {
      var friend = await db.getUser(friend_id);
      posts = posts.concat(friend.posts);
    }

    res.json({
      success: true,
      posts: posts
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function getPost(req, res) {
  var post_id = req.query.post_id;

  try {
    let data = await db.getPost(post_id);
    res.json({
      success: true,
      post_id: post_id,
      post_data: {
        user_id: data.user_id,
        data: data.data,
        timestamp: data.timestamp,
      },
      comments: data.comments,
      likes: data.likes,
    });
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function addLike(req, res) {
  var post_id = req.body.post_id;
  var user_id = req.body.user_id;

  try {
    await db.addLike(post_id, user_id);
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function addComment(req, res) {
  var user_id = req.body.user_id;
  var post_id = req.body.post_id;
  var data = req.body.data;

  try {
    await db.addComment(post_id, user_id, data, getTime());
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function addPost(req, res) {
  var user_id = req.body.user_id;
  var post_id = newID();
  var post_data = req.body.post_data;

  try {
    await db.addPost(post_id, user_id, post_data, getTime());
    res.json({success: true, post_id: post_id});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function addFriend(req, res) {
  var user_id = req.query.user_id;
  var friend_id = req.query.friend_id;

  try {
    await db.addFriend(user_id, friend_id);
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function getUserChats(req, res) {
  var user_id = req.query.user_id;

  try {
    var data = await db.getUser(user_id);
    res.json({success: true, chats: data.chats});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function getChatUsers(req, res) {
  var chat_id = req.query.chat_id;

  try {
    var data = await db.getChat(chat_id);
    res.json({success: true, users: data.users});
  } catch (err) {
    res.json({success: false,error: err});
  }
}

async function getChat(req, res) {
  var chat_id = req.query.chat_id;

  try {
    var data = await db.getChat(chat_id);
    res.json({
      success: true,
      chat_id: chat_id,
      users: data.users,
      messages: data.messages
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function addChat(req, res) {
  var users = req.body.users;
  var chat_id = newID();

  try {
    await db.addChat(chat_id, users);
    res.json({success: true, chat_id: chat_id});
  } catch (err) {
    res.json({success: false, error: err});
  }
}


async function addMessage(req, res) {
  var user_id = req.session.user_id;
  var chat_id = req.body.chat_id;
  var data = req.body.data;

  try {
    await db.addMessage(chat_id, user_id, data, getTime());
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function leaveChat(req, res) {
  var user_id = req.session.user_id;
  var chat_id = req.body.chat_id;

  try {
    await db.removeUserFromChat(chat_id, user_id );
    res.json({success: true});
  } catch (err) {
    res.json({success: false, error: err});
  }
}

async function addUserToChat(req, res) {
  var user_id = req.body.user_id;
  var chat_id = req.body.chat_id;

  try {
    await db.addUserToChat(chat_id, user_id);
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function changeAffiliation(req, res) {
  var user_id = req.body.user_id;
  var affiliation = req.body.affiliation;

  try {
    await db.changeAffiliation(user_id, affiliation);
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function changeName(req, res) {
  var user_id = req.body.user_id;
  var name = req.body.name;

  try {
    await db.changeName(user_id, name);
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function editProfile(req, res) {
  res.render('editprofile.ejs', {currentUser: req.session.user_id});
}

async function changeEmail(req, res) {
  var user_id = req.body.user_id;
  var email = req.body.email;

  try {
    await db.changeEmail(user_id, email);
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}

async function getUsersWithPrefix(req, res) {
  var prefix = req.query.prefix;

  try {
    var data = await db.getUsersWithPrefix(prefix);
    res.json({
      success: true,
      users: data
    });
  } catch (err) {
    res.json({
      success: false,
      error: err
    });
  }
}




async function getFriends(req, res) {
  var user_id = req.session.user_id;
	var clickedOn = req.params.user;


	var user_data = await db.getUser(user_id);
	var clickedOn_data = await db.getUser(clickedOn);


	if (sameAffiliation(user_data.affiliation, clickedOn_data.affiliation)) {
		var newFriends = await buildObject(clickedOn);
		var topLevelChildren = [];

		for (friend of clickedOn_data.friends) {
			var child_obj = await buildObject(friend);
			topLevelChildren.push(child_obj);
		}

		for (var i = topLevelChildren.length - 1; i >= 0; i--) {
			// friend of person I clicked on
			var current = topLevelChildren[i];
			var currentData = await db.getUser(current.id);
			if (sameAffiliation(user_data.affiliation, currentData.affiliation)) {
				// friend of friend of who I clicked on
				var friends = currentData.friends;
				for (friend in friends) {
					if (i > getIndex(friends[friend], topLevelChildren)) {
						var idObj = {
							"id": friends[friend]
						};
						current.children += idObj;
					}
				}
			}

		}
		newFriends.children = topLevelChildren;
		res.send(newFriends);
	}

}


async function sameAffiliation(afil1, afil2) {
	var contained = false;
	for (const a1 of afil1) {
		for (const a2 of afil2) {
			if (a1 == a2) {
				contained = true;
			}
		}
	}
	return contained;
}

async function buildObject (user_id) {
	var user_data = await db.getUser(user_id);
	obj = {
		"id": user_id,
		"name": user_data.name,
		"children": [],
		"data": []
	};
	return obj;
}

function getIndex (user_id, children) {
	for (var i = 0; i < children.length; i++) {
		if (user_id == children[i].user_id) {
			return i;
		}
	}
	return children.length;
}


async function friendvisualization(req, res) {
  var user_id = req.session.user_id;


	try {
		var topLevelObj = await buildObject(user_id);

		var topLevelChildren = [];
		var user_data = await db.getUser(user_id);

		for (friend of user_data.friends) {
			// make sure I am passing in the id!
			var child_obj = await buildObject(friend);

			topLevelChildren.push(child_obj);
		}


		for (var i = topLevelChildren.length - 1; i >= 0; i--) {
			var current = topLevelChildren[i];
			var currentData = await db.getUser(current.id);

			var friends = currentData.friends;

			for (friend of friends) {
        var idx = getIndex(friend, topLevelChildren);
				if (i > idx) {
					var idObj = {
						"id": friend
					};
					current.children.push(idObj);
				}
			}
		}

		topLevelObj.children = topLevelChildren;
		res.send(topLevelObj);
	} catch (err) {
		res.json({
			success: false,
			error: err
		});
	}
}

async function friendvisualizer(req, res) {
	res.render('friendvisualizer.ejs');
};

var routes = {
  getCurrentUser: getCurrentUser,
  signup: signup,
  addaccount: addAccount,
  login: login,
  logout: logout,
  init: init,
  homepage: homepage,
  getuserposts: getUserPosts,
  searchuser: searchUser,
  getpostcomments: getPostComments,
  checklogin: checkLogin,
  newsfeed: newsFeed,
  getfeed: getFeed,
  getpost: getPost,
  addlike: addLike,
  addcomment: addComment,
  addpost: addPost,
  addfriend: addFriend,
  getuserchats: getUserChats,
  getchatusers: getChatUsers,
  chat: chat,
  getuserdata: getUserData,
  getchat: getChat,
  addchat: addChat,
  leavechat: leaveChat,
  addusertochat: addUserToChat,
  addmessage: addMessage,
  leavechat: leaveChat,
  addusertochat: addUserToChat,
  getuserswithprefix: getUsersWithPrefix,
  changeaffiliation: changeAffiliation,
  changename: changeName,
  changeemail: changeEmail,
  editprofile: editProfile,
  getFriends: getFriends,
  friendvisualization: friendvisualization,
  friendvisualizer: friendvisualizer,
};


module.exports = routes;
