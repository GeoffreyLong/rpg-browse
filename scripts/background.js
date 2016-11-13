// Assumptions of formats
//    Messages returned = {
//      "response": <"Success", "Error">,
//      "message": String
//    }
//    gather = {
//      "action": "gather",
//      "word": String,
//    }
// TODO finish these notes 


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
    user.numPulls = 0;
    user.numStores = 0;
    user.xp = 0;

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
    user.numPulls = obj.numPulls;
    user.numStores = obj.numStores;
    user.xp = obj.xp;
  }
});


// Populate gameObjs
$.getJSON("GameObjects.json", function(data) {
  if (data.length > 0) {
    alert("Found game objects");
    gameObjs = data;
    var gameObjSend = {};
    gameObjSend["GameObjects"] = data;
    chrome.storage.sync.set(gameObjSend, function() { console.log("Saved GameObjects"); });
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
    // May want to compare the lower cased versions of these
    var returnMessage = {};
    if (msg.action == "gather") {
      returnMessage = gather(msg.word);
    }
    else if (msg.action == "attack") {
      returnMessage = fight(msg.data);
    }
    else if (msg.action == "heal") {
      returnMessage = heal(msg.data);
    }
    else if (msg.action == "store") {
      returnMessage = store();
    }
    else if (msg.action == "combine") {
      returnMessage = combine();
    }
    else {
      returnMessage.response = "Error";
      returnMessage.message = "Could not find corresponding action";
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
      user.xp = user.xp + newObj.value * 10;
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

  var userAttack = 0;
  for (item in user.packStorage) {
    var attack = user.packStorage[item];

    // temporary method... not very good
    userAttack += attack;
  }

  user.health = user.health - (Math.ceil(data.health / userAttack - 1) * data.attack);

  // if (Math.ceil(user.health / data.attack) >= Math.ceil(data.health / userAttack)) {
  if (user.health > 0) {
    returnMessage.response = "Success";
    returnMessage.message = "Successfully vanquished the foe!";
    user.xp = uxer.xp + (Math.ceil(data.health * data.attack));
  }
  else {
    returnMessage.response = "Error";
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



function heal(data) {
  var returnMessage = {};
  
  if (user.health < user.maxHealth) {
    returnMessage.response = "Success";
    returnMessage.message = "Healed by " + data.health + " health points";

    user.health += data.health;
    // Probs don't need to pass this whole thing...
    chrome.storage.sync.set(user, function() { console.log("Saved user"); });
  }
  else {
    returnMessage.response = "Error";
    returnMessage.message = "Couldn't heal you any more. Already at max health!"
  }

  return returnMessage;
}



// ALL OF THE FOLLOWING METHODS MUST BE DONE THROUGH THE POPUP
function combine() {
  var returnMessage = {};
  returnMessage.response = "Success";
  returnMessage.message = "You got another combination token, see popout to use."

  // Simply increment the number of combines we can use
  user.numCombines = user.numCombines + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(user, function() { console.log("Saved user"); });
}
function store() {
  var returnMessage = {};
  returnMessage.response = "Success";
  returnMessage.message = "You got another stashing token, see popout to use."

  // Simply increment the number of combines we can use
  user.numStores = user.numStores + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(user, function() { console.log("Saved user"); });
}
function pull() {
  var returnMessage = {};
  returnMessage.response = "Success";
  returnMessage.message = "You got another packing token, see popout to use."

  // Simply increment the number of combines we can use
  user.numPulls = user.numPulls + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(user, function() { console.log("Saved user"); });
}
