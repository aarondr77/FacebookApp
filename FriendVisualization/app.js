var express = require('express');
var app = express();
var routes = require('./routes/routes.js');


app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({secret: "secretSession"}));
app.use('/', express.static(__dirname + "/public",{maxAge:1}));

app.get('/', function(req, res) {
	res.render('friendvisualizer.ejs');
});

app.get('/friendvisualization', routes.friendvisualization);
/*
app.get('/friendvisualization', function(req, res) {

	var json ={"id":"aaron","name":"aaron d","children":[{"id":"1","name":"1","data":{},"children":[]},{"id":"2","name":"2","data":{},"children":[]},{"id":"3","name":"3","data":{},"children":[]},{"id":"4","name":"4","data":{},"children":[]},{"id":"nate","name":"nate r","data":{},"children":[{"id":"will"}]},
{"id":"will","name":"will w","data":{},"children":[{"id":"nate"}]}],"data":[]};

    res.send(json);
});
*/


app.get('/getFriends/:user', routes.getFriends);
/*
app.get('/getFriends/:user', function(req, res) {
	  console.log("HERE");
    console.log(req.params.user);
		*/
/*
		var obj = {};

		var users;

		for (const user of users) {
			obj[user.user_id] = {}
			obj[user.user_id]


		}

		obj["id"] = "alice";
		obj["name"] = "Alice";

		obj["children"] = [{

		}];
*/
/*
    var newFriends = {"id": "alice","name": "Alice","children": [{
        "id": "james",
            "name": "James",
            "data": {},
            "children": [{
                "id": "arnold",
                "name": "Arnold",
                "data": {},
                "children": []
            }, {
                "id": "elvis",
                "name": "Elvis",
                "data": {},
                "children": []
            }]
        }, {
            "id": "craig",
            "name": "Craig",
            "data": {},
            "children": [{
                "id":"arnold"
            }]
        }, {
            "id": "amanda",
            "name": "Amanda",
            "data": {},
            "children": []
        }, {
            "id": "phoebe",
            "name": "Phoebe",
            "data": {},
            "children": []
        }, {
            "id": "spock",
            "name": "Spock",
            "data": {},
            "children": []
        }, {
            "id": "matt",
            "name": "Matthe",
            "data": {},
            "children": []
        }],
        "data": []
    };
    res.send(newFriends);
		*/

/* Run the server */
console.log('Running friend visualization on 127.0.0.1:8080');
app.listen(8080);
