console.log("Background");

// Make user accessible
var user = {};
// Make game objects accessible
var gameObjs = [];
// Make keywords accessible
var keywords = {};


// Populate user
chrome.storage.sync.get(null, function(obj) {
  // Get the user
  if (jQuery.isEmptyObject(obj)) {
    alert("Empty Object Found");
    
    // Create a new user
    user.health = 100;
    user.maxHealth = 100;
    user.packSize = 20;
    user.packStorage = [];
    user.homeStorage = [];
    user.acheivements = {};
    user.acheivements.pages = 0;
    user.numCombines = 0;

    chrome.storage.sync.set(user, function() { console.log("Saved user"); });
  }
  else {
    alert("User Found");

    // Populate the user
    user.health = obj.health;
    user.maxHealth = obj.maxHealth;
    user.packSize = obj.packSize;
    user.packStorage = obj.packStorage;
    user.homeStorage = obj.homeStorage;
    user.acheivements = obj.acheivements;
    user.numCombines = obj.numCombines;
  }
});


// Populate gameObjs
$.getJSON("GameObjects.json", function(data) {
  if (data.length > 0) {
    alert("Found game objects");
    gameObjs = data;
  }
  else {
    alert("Couldn't read game objects");
  }
});


// Populate keywords
$.getJSON("keywords.json", function(data) {
  if (data.length > 0) {
    alert("Found keywords");
    keywords = {};
    keywords["keywords"] = data;
    chrome.storage.sync.set(keywords, function() { console.log("Saved keywords"); });
  }
  else {
    alert("Couldn't read keywords");
  }
});




// Connect the listener
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "scraper");
  port.onMessage.addListener(function(msg) {
    var returnMessage = {};
    if (msg.action == "gather") {
      returnMessage = gather(msg.word);
    }
    else if (msg.action == "attack") {
      returnMessage = fight(msg.data);
    }
    else if (msg.action == "heal") {

    }
    else if (msg.action == "store") {
      // More difficult since need gui implementation
    }
    else if (msg.action == "combine") {
      returnMessage = combine();
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

    // Very slow way to find the correct object
    for (i in gameObjs) {
      gobj = gameObjs[i];
      // If object matches then add in necessary fields
      if (gobj.name && gobj.name.toLowerCase() == resource.toLowerCase()) {
        newObj.name = gobj.name;
        newObj.icon = gobj.icon;
        newObj.value = gobj.value;
        newObj.damage = gobj.damage;
        newObj.combinations = jQuery.extend(true, {}, gobj.combinations);
      }
    }

    if (jQuery.isEmptyObject(newObj)) {
      returnMessage.response = "Error";
      returnMessage.message = "Couldn't add " + resource + " to your pack";
    }
    else {
      returnMessage.response = "Success";
      returnMessage.message = "Added " + resource + " to your pack";
      user.packStorage.push(newObj);
    }

    // Probs don't need to pass this whole thing...
    chrome.storage.sync.set(user, function() { console.log("Saved user"); });
  }
  else {
    returnMessage.response = "Error";
    returnMessage.message = "Your pack is too full!"
  }

  return returnMessage;
}


// Fight something
function fight(data) {
  var returnMessage = {};
  returnMessage.response = "Success";

  var userAttack = 0;
  for (item in user.packStorage) {
    var attack = user.packStorage[item];

    // temporary method... not very good
    userAttack += attack;
  }

  user.health = user.health - (Math.ceil(data.health / userAttack - 1) * data.attack);

  // if (Math.ceil(user.health / data.attack) >= Math.ceil(data.health / userAttack)) {
  if (user.health > 0) {
    returnMessage.message = "Successfully vanquished the foe!"
  }
  else {
    returnMessage.message = "OH NO! YOU DIED!!!"

    // Reset the health value
    // Reset the pack storage
    user.health = user.maxHealth;
    user.packStorage = [];
  }

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(user, function() { console.log("Saved user"); });

  return returnMessage;
}

// Combine two items
// This will have to be done through the popup...
function combine() {
  // Simply increment the number of combines we can use
  user.numCombines = user.numCombines + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(user, function() { console.log("Saved user"); });
}
