var express = require('express');
var async = require('async');
var routes = require('./routes/routes.js');
var app = express();
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var async = require('async');

//server.listen(80);
server.listen(8080);
app.use('/', express.static(__dirname + "/public",{maxAge:1}));




io.on('connection', function (socket) {
  socket.on('joinroom', function (chat_id) {
    console.log('socket joined room');
    socket.join(chat_id);
  });

  socket.on('leaveroom', function (chat_id) {
    console.log('left room');
    socket.leave(chat_id);
  })

  socket.on('sendmessage', function (msg) {
    var clients = io.sockets.adapter.rooms[msg.chat_id].sockets;
    io.to(msg.chat_id).emit('sendmessage', msg, msg.chat_id);
  });
});


// Setup app basics
app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({secret: 'secretData', cookies: {user_id: ''}})); // random secret data

// current user route
app.get('/getCurrentUser', routes.getCurrentUser);
app.post('/changeaffiliation', routes.changeaffiliation);
app.post('/changename', routes.changename);
app.post('/changeemail', routes.changeemail);
app.get('/editprofile', routes.editprofile);
// create account routes
app.get('/signup', routes.signup);
app.post('/addaccount', routes.addaccount);

// login routes
app.get('/login', routes.login);
app.post('/checklogin', routes.checklogin);
app.get('/', routes.init);
app.get('/homepage', routes.homepage);
app.get('/logout', routes.logout);

//newsfeed routes
app.get('/newsfeed', routes.newsfeed);
app.get('/getfeed', routes.getfeed);
app.get('/getpost', routes.getpost);
app.post('/addlike', routes.addlike);
app.post('/addcomment', routes.addcomment);
app.post('/addpost', routes.addpost);
app.get('/getuserdata', routes.getuserdata);
app.get('/getuserswithprefix', routes.getuserswithprefix);

// Friendship
app.get('/addfriend', routes.addfriend);

// homepage routes
app.get('/getuserposts', routes.getuserposts);
app.get('/getpostcomments', routes.getpostcomments);
app.post('/searchuser', routes.searchuser);

// chat routes
app.get('/chat', routes.chat);
app.get('/getuserchats', routes.getuserchats);
app.get('/getchatusers', routes.getchatusers);
app.get('/getchat', routes.getchat);
app.post('/addchat', routes.addchat);
app.post('/addmessage', routes.addmessage);
app.post('/leavechat', routes.leavechat);
app.post('/addusertochat', routes.addusertochat);

// friendvisualizer
app.get('/getFriends/:user', routes.getFriends);
app.get('/friendvisualization', routes.friendvisualization);
app.get('/friendvisualizer', routes.friendvisualizer);


console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
