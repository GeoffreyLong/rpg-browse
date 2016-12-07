// TODO add populations for 
//      num page visits, num combos, num items gathered, num fights won
//      num fights lost, num items dropped
// TODO Fix the logic of the storage tags


// A novel way to do combinations would be to assign an id to each item
//    The value of the combined item could be the sum of the combined ids

var app = angular.module("appGui", ['ngMaterial']);
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}]);
app.controller("myCtrl", function($scope, $q) {
  $scope.comboHelper = -1;
  $scope.user = {};
  $scope.packStorage = [];
  $scope.homeStorage = [];
  $scope.GameObjects = [];
  $scope.combinations = [];
  populateData();


  // Should probably encapsulate this in a service?
  // Actually, this html is being reloaded each time...
  // This just seems inefficient to do it this way though
  function populateData() {
    // TESTING LOOP TODO REMOVE
    chrome.storage.sync.get(null, function(obj) {
      console.log(obj);
    });


    // Set all the requisite fields
    getStorage("user");
    getStorage("packStorage");
    getStorage("homeStorage");
    getStorage("GameObjects");
    getStorage("combinations");
  }


  // This will populate the scope with the specific field that is passed in
  function getStorage(key) {
    // This is a promise to get the key and value from the storage sync
    function storagePromise(key) {
      var defer = $q.defer();
      chrome.storage.sync.get(key, function(obj) {
        defer.resolve(obj);
      });
      
      return defer.promise;
    }

    // Set the scope variable 
    storagePromise(key).then(function(result) {
      $scope[key] = result[key];
    });
  }



  // This is all the logic for the buttons
  // Will basically handle the highlighting and will append classes for later processing
  $scope.toggleButton = function(action) {
    // Get the home and pack storage elements from the DOM by their classes
    var packElms = angular.element(document.getElementsByClassName("pack"));
    var homeElms = angular.element(document.getElementsByClassName("home"));

    // Stash and combine both affect the home elements
    // This will add and remove the correct classes to toggle
    if (action == "stash" || action == "combine") {
      packElms.toggleClass(action);
      if (packElms.hasClass(action)) {
        homeElms.removeClass("pull");
        packElms.removeClass("stash");
        packElms.removeClass("combine");
        packElms.addClass(action);
      }
    }
    else if (action == "pull") {
      homeElms.toggleClass(action);
      if (homeElms.hasClass(action)) {
        packElms.removeClass("stash");
        packElms.removeClass("combine");
      }
    }

    if (action != "combine") {
      angular.element(document.getElementsByClassName("inCombo")).removeClass("inCombo");
    }
  }

  // This runs when an item button is pressed
  $scope.itemAction = function(idx, e) {
    var elm = angular.element(e.target);
    console.log(idx + " clicked");

    if (elm.parent().hasClass("stash")) {
      runStash(idx);
    }
    if (elm.parent().hasClass("pull")) {
      runPull(idx);
    }
    if (elm.parent().hasClass("combine")) {
      elm.parent().toggleClass("inCombo");
      runCombine(idx);
    }
  }

  // Stash function
  function runStash(idx) {
    // Update the GUI button
    console.log("Stashing");
    $scope.toggleButton("stash");

    // Update the proper storages
    var item = $scope.packStorage[idx];
    $scope.packStorage.splice(idx, 1);
    $scope.homeStorage.push(item);

    // Update the user variable
    $scope.user.numStores = $scope.user.numStores - 1;
    if ($scope.user.numStores == 0) {
      angular.element(document.getElementById("stasher")).prop('disabled', true);
    }
    
    // Set all the relevant fields in storage
    chrome.storage.sync.set({"packStorage": $scope.packStorage});
    chrome.storage.sync.set({"homeStorage": $scope.homeStorage});
    chrome.storage.sync.set({"user": $scope.user});
  }

  // Pull function
  function runPull(idx) {
    // Update the GUI button
    console.log("Equipping");
    $scope.toggleButton("pull");

    // Update the proper storages
    var item = $scope.homeStorage[idx];
    $scope.homeStorage.splice(idx, 1);
    $scope.packStorage.push(item);

    // Update the user variable
    $scope.user.numPulls = $scope.user.numPulls - 1;
    if ($scope.user.numPulls == 0) {
      angular.element(document.getElementById("puller")).prop('disabled', true);
    }
    
    // Set all the relevant fields in storage
    chrome.storage.sync.set({"packStorage": $scope.packStorage});
    chrome.storage.sync.set({"homeStorage": $scope.homeStorage});
    chrome.storage.sync.set({"user": $scope.user});
  }

  // Combine two items
  // This is kindof slow, but right now I believe it is fast enough
  function runCombine(idx) {
    console.log("Combining");

    // Only combine if there are two "inCombo"s 
    // If there are 0 elements selected then reset the helper to -1
    //    This probably isn't necessary since the value of -1 is never used
    // If there is one, then set the helper to the idx
    //    This also is likely unnecessary... can probably just go with the inCombo idx
    var combos = document.getElementsByClassName("inCombo");
    if (combos.length == 0) {
      $scope.comboHelper = -1;
    }
    if (combos.length == 1) {
      $scope.comboHelper = idx;
    }
    if (combos.length == 2) {
      $scope.toggleButton("combine");

      // Make sure indexOne is before indexTwo
      var indexOne = $scope.comboHelper;
      var indexTwo = idx;
      if (indexOne > indexTwo) {
        indexOne = idx;
        indexTwo = $scope.comboHelper;
      }

      angular.element(combos).removeClass("inCombo");
      var elmOne = $scope.packStorage[indexOne];
      var elmTwo = $scope.packStorage[indexTwo];
      var newElm = null;

      for (var comboIdx in $scope.combinations) {
        var combo = $scope.combinations[comboIdx];

        // There will only be two inputs in an array
        var inputs = combo.inputs;
        if ((inputs[0] == elmOne.name && inputs[1] == elmTwo.name)
            || (inputs[0] == elmTwo.name && inputs[1] == elmOne.name)) {
          newElm = combo.result;
          break;
        }
      }



      // Iterate over the game objects 
      // Populate the trash element and the newElm element
      // TODO I don't know if I need each field separately... might just want the full obj
      var trash = null;
      for (var gameObjIdx in $scope.GameObjects) {
        var gameObj = $scope.GameObjects[gameObjIdx];
        if (gameObj.name == newElm) {
          console.log("Populating Object");
          newElm = {};
          newElm.name = gameObj.name;
          newElm.value = gameObj.value;
          newElm.attack = gameObj.attack;
          newElm.icon = gameObj.icon;
        }
        if (gameObj.name == "Trash") {
          trash = {};
          trash.name = gameObj.name;
          trash.value = gameObj.value;
          trash.attack = gameObj.attack;
          trash.icon = gameObj.icon;
        }
      }


      // Set the newElm to trash if there was no combination found
      if (newElm == null) newElm = trash;

      // Set the pack storage
      // Need indexTwo spliced before indexOne since it will change the underlying array
      $scope.packStorage.splice(indexTwo, 1);
      $scope.packStorage.splice(indexOne, 1);
      $scope.packStorage.push(newElm);
      chrome.storage.sync.set({"packStorage": $scope.packStorage});

      // Set the numCombines
      $scope.user.numCombines = $scope.user.numCombines - 1;
      chrome.storage.sync.set({"user": $scope.user});
      if ($scope.user.numCombines == 0) {
        angular.element(document.getElementById("combiner")).prop('disabled', true);
      }
    }
  }
});
