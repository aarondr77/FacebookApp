// GETS ALL DATA TO DATABASE AND WRITES IT TO FILES
const fs = require('fs');
var db = require('../models/database.js');

var outputFolder = "output";

async function main() {
  console.log("running main");

  fs.readdir(outputFolder, (err, files) => {
    files.forEach(file => {
      if (file.startsWith("part-r") && !file.endsWith("crc")) {
        readFriendRecFile(file);
      }
    });
  })
  return;
}


async function readFriendRecFile(file) {
  fs.readFile(outputFolder + "/" + file, async function (err, data) {
    console.log(file)
    var friendRecs = {}
    var lines = data.toString().split("\n");
    lines.forEach(line => {
      var edge = line.split("\t");
      if (edge.length === 3) {
        var user_id = edge[0];
        var friend_id = edge[1];
        var weight = edge[2];

        if (!friendRecs[user_id]) {
          friendRecs[user_id] = [];
        }

        friendRecs[user_id].push({friend_id: friend_id, weight: weight})
      };
    });

    for (const key in friendRecs) {
      var recs = friendRecs[key];
      recs.sort(function(a, b) {
        var weightA = parseFloat(a.weight)
        var weightB = parseFloat(b.weight)
        if(weightA < weightB) return 1;
        if(weightA > weightB) return -1;
        return 0;
      });

      // Now that we have sorted them, we upload the top 5 (you don't need that many friend recs)
      var uploaded = 0;
      for (const rec of recs) {
        try {
          if (key === rec.friend_id) continue;
          var user = await db.getUser(key);
          var friend = await db.getUser(rec.friend_id);
          if (user && friend && uploaded < 5) {
            console.log("trying to upload for: " + key + ", " + rec.friend_id);
            await db.addFriendRec(key, rec.friend_id);
            console.log("Uploading friend rec for: " + key + ", " + rec.friend_id);
            uploaded++;
          }
        } catch (err) {
          // we don't care about errors
        }
      }





    }

  });
}


main();
