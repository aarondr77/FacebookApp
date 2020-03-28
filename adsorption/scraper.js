// GETS ALL DATA TO DATABASE AND WRITES IT TO FILES
const fs = require('fs');
var db = require('../models/database.js');

var outputFile = "input/input.txt";

async function main() {
  console.log("Getting data from databases...");
  let users = await db.internalScanDB(db.userDB);
  console.log("USERS");
  console.log(users);
  let affiliations = await db.internalScanDB(db.affilDB);

  console.log("Building output string...")
  var str = getUserFriendEdges(users, "");
  str = getAffilEdges(affiliations, str);

  console.log("Writing data to file...");
  if (fs.exists(outputFile)) {
    fs.unlink(outputFile, (err) => {
      fs.writeFile(outputFile, str, (err1) => {
          if (err1) throw err1;
          console.log("Data written to file.");
      });
    });
  } else {
    fs.writeFile(outputFile, str, (err) => {
        if (err) throw err;
        console.log("Data written to file.");
    });
  }
}


function getUserFriendEdges(users, str) {
  for (const user of users) {
    if (user.friends) {
      for (const friend of user.friends) {
        str += user.user_id + "\t" + friend + "\n";
      }
    }
  }
  return str;
}

function getAffilEdges(affiliations, str) {
  for (const affil of affiliations) {
    if (affil.users) {
      for (const user of affil.users) {
        // edges go both ways here
        str += affil.affiliation + "\t" + user + "\n";
        str += user + "\t" + affil.affiliation + "\n";
      }
    }
  }
  return str;
}

main();
