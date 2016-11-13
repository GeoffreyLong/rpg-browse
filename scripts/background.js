console.log("Background");

// Make user accessible
var user = {};
// Make game objects accessible
var gameObjs = [];


// Populate user
chrome.storage.sync.get(null, function(obj) {
  // Get the user
  if (jQuery.isEmptyObject(obj)) {
    alert("Empty Object Found");
    
    // Create a new user
    user.health = 100;
    user.packSize = 20;
    user.packStorage = [];
    user.homeStorage = [];
    user.acheivements = {};
    user.acheivements.pages = 0;

    chrome.storage.sync.set(user, function() { console.log("Saved user"); });
  }
  else {
    alert("User Found");

    // Populate the user
    user.health = obj.health;
    user.packSize = obj.packSize;
    user.packStorage = obj.packStorage;
    user.homeStorage = obj.homeStorage;
    user.acheivements = obj.acheivements;
  }
});


// Populate gameObjs




// Connect the listener
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "scraper");
  port.onMessage.addListener(function(msg) {
    var returnMessage = {};
    if (msg.action == "gather") {
      returnMessage = gather(msg.data);
    }
    else if (msg.action == "fight") {

    }
    else if (msg.action == "store") {

    }
    else {
      returnMessage.response = "Error";
      returnMessage.message = "Unknown error occurred";
    }

    port.postMessage(returnMessage);
  });
});

// Gather resource function
function gather(resource) {
  var returnMessage = {};
  if (user.packStorage.length < user.packSize) {
    var newObj = {};

    // TODO find and populate object...

    // TEMPORARY!!!
    var sword = {
      "name": "Sword",
      "icon": "img/sword.png",
      "value": 5,
      "damage": 5,
      "combinations": [{
        "result": "Golden Sword",
        "inputs": ["Gold", "Sword"]
      }]
    };
    user.packStorage.push(sword);

    returnMessage.response = "Success";
    returnMessage.message = "Added " + resource + " to your pack";

    // Probs don't need to pass this whole thing...
    chrome.storage.sync.set(user, function() { console.log("Saved user"); });
  }
  else {
    returnMessage.response = "Error";
    returnMessage.message = "Your pack is too full!"
  }

  return returnMessage;
}
