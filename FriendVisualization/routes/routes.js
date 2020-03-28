var db = require('../../models/database.js');
var async = require('async');
var vogels = require('vogels');
const fs = require('fs');
vogels.AWS.config.loadFromPath('credentials.json');

var user_id = "aaron";


async function getFriends(req, res) {
	console.log("NODE CLICKED ON");
	var clickedOn = req.params.user;

	console.log(clickedOn);

	var user_data = await db.getUser(user_id);
	var clickedOn_data = await db.getUser(clickedOn);

	console.log(user_data);

	if (sameAffiliation(user_data.affiliation, clickedOn_data.affiliation)) {
		var newFriends = await buildObject(user_id);
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
		console.log(newFriends);
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
	console.log(user_data);
	obj = {
		"id": user_id,
		"name": user_data.name,
		"children": [],
		"data": []
	};
	return obj;
}

async function getIndex (user_id, children) {
	for (var i = 0; i < children.length; i++) {
		if (user_id == children[i].user_id) {
			return i;
		}
	}
	return -1;
}


async function friendvisualization(req, res) {
	console.log("running route");

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

			for (friend in friends) {
				if (i > getIndex(friends[friend], topLevelChildren)) {

					var idObj = {
						"id": friends[friend]
					};
					current.children += idObj;
				} else if (getIndex(friends[friend], topLevelChildren) == -1) {
					var newFriend_data = db.getUser(friends[friend]);
					var obj = {
						"id": friends[friend],
						"name": newFriend_data.name,
						"children": [],
						"data": []
					};
					current.children += obj;
				}
			}
		}

		topLevelObj.children = topLevelChildren;
		console.log(topLevelObj);
		res.send(topLevelObj);
	} catch (err) {
		console.log("ERROR");
		res.json({
			success: false,
			error: err
		});
	}
}

async function friendvisualizer(req, res) {
	res.render('friendvisualizer.ejs');
};

var vizualizerRoutes = {
	friendvisualization: friendvisualization,
	getFriends: getFriends,
	friendvisualizer: friendvisualizer,
};

module.exports = vizualizerRoutes;
