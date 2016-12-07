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


console.log("Background running");

// Make the main obj accessible
var mainObj = {};
mainObj.user = {};
mainObj.acheivements = {};
// Make game objects accessible
var gameObjs = [];
// Make keywords accessible
var keywords = {};


// Populate user
chrome.storage.sync.get(null, function(obj) {
  // Get the user
  if (jQuery.isEmptyObject(obj)) {
    alert("Empty Object Found");
    
    // Create a new obj
    mainObj.packStorage = [{
      "name": "Stick",
      "value": 3,
      "damage": 3,
      "isKeyword": true,
      "icon": "img/stick.png"
    }];
    mainObj.homeStorage = [];
    mainObj.user.health = 100;
    mainObj.user.maxHealth = 100;
    mainObj.user.packSize = 20;
    mainObj.user.numCombines = 0;
    mainObj.user.numPulls = 0;
    mainObj.user.numStores = 0;
    mainObj.user.xp = 0;
    mainObj.acheivements.pages = 0;

    chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });
  }
  else {
    alert("User Found");

    // Populate the mainObj
    mainObj = obj;
  }
});


// Populate gameObjs
$.getJSON("data/gameobjects.json", function(data) {
  if (data.length > 0) {
    alert("Found game objects");

    // Make gameObjs accessible outside fn
    gameObjs = data;

    chrome.storage.sync.set({"GameObjects": data}, function() { console.log("Saved GameObjects"); });
  }
  else {
    alert("Couldn't read game objects");
  }
});

// Populate Combinations
$.getJSON("data/combinations.json", function(data) {
  if (data.length > 0) {
    alert("Found combinations");

    // Make combinations accessible outside fn
    combinations = data;

    chrome.storage.sync.set({"combinations": data}, function() { console.log("Saved GameObjects"); });
  }
  else {
    alert("Couldn't read combinations");
  }
});


// Populate keywords
$.getJSON("data/keywords.json", function(data) {
  if (data.length > 0) {
    alert("Found keywords");

    chrome.storage.sync.set({"keywords": data}, function() { console.log("Saved keywords"); });
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
    
    console.log(msg);
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
    else if (msg.action == "pull") {
      returnMessage = pull();
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
  if (mainObj.packStorage.length < mainObj.user.packSize) {
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
      mainObj.user.xp = mainObj.user.xp + newObj.value * 10;
      mainObj.packStorage.push(newObj);
    }

    chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });
  }
  else {
    returnMessage.response = "Error";
    returnMessage.message = "Your pack is full!"
  }

  return returnMessage;
}


// Fight something
function fight(data) {
  var returnMessage = {};

  var userAttack = 0;
  for (item in mainObj.packStorage) {
    var attack = mainObj.packStorage[item];

    // temporary method... not very good
    userAttack += attack;
  }

  mainObj.user.health = mainObj.user.health - (Math.ceil(data.health / userAttack - 1) * data.attack);

  // if (Math.ceil(user.health / data.attack) >= Math.ceil(data.health / userAttack)) {
  if (mainObj.user.health > 0) {
    returnMessage.response = "Success";
    returnMessage.message = "Successfully vanquished the foe!";
    mainObj.user.xp = mainObj.user.xp + (Math.ceil(data.health * data.attack));
  }
  else {
    returnMessage.response = "Error";
    returnMessage.message = "OH NO! YOU DIED!!!"

    // Reset the health value
    // Reset the pack storage
    mainObj.user.health = mainObj.user.maxHealth;
    mainObj.packStorage = [{
      "name": "Stick",
      "value": 3,
      "damage": 3,
      "isKeyword": true,
      "icon": "img/stick.png"
    }];
  }

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });
  return returnMessage;
}



function heal(data) {
  var returnMessage = {};
  
  if (mainObj.user.health < mainObj.user.maxHealth) {
    returnMessage.response = "Success";
    returnMessage.message = "Healed by " + data.health + " health points";

    mainObj.user.health += data.health;
    // Probs don't need to pass this whole thing...
    chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });
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
  mainObj.user.numCombines = mainObj.user.numCombines + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });

  return returnMessage;
}
function store() {
  var returnMessage = {};
  returnMessage.response = "Success";
  returnMessage.message = "You got another stashing token, see popout to use."

  // Simply increment the number of combines we can use
  mainObj.user.numStores = mainObj.user.numStores + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });

  return returnMessage;
}
function pull() {
  var returnMessage = {};
  returnMessage.response = "Success";
  returnMessage.message = "You got another packing token, see popout to use."

  // Simply increment the number of combines we can use
  mainObj.user.numPulls = mainObj.user.numPulls + 1;

  // Probs don't need to pass this whole thing...
  chrome.storage.sync.set(mainObj, function() { console.log("Saved user"); });

  return returnMessage;
}
