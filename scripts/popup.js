// TODO add populations for 
//      num page visits, num combos, num items gathered, num fights won
//      num fights lost, num items dropped
// TODO Do I have to do the digests since the functions aren't on the scope?
// TODO Fix the get items function (after fixing the objs)
// TODO Fix the actual objects for the user...
//      Want to have user with all the numPulls, xp, etc
//      Want to have pack and home storage as is
//      Want to have acheivments (see first todo) also
// TODO Fix the logic of the storage tags
// TODO The GUI is no longer updating on actions ...

var app = angular.module("appGui", ['ngMaterial']);
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}]);
app.controller("myCtrl", function($scope, $q) {
  $scope.comboHelper = -1;

  // Would be best just to have one items and then the storage flag
  $scope.user = {};
  $scope.packStorage = [];
  $scope.homeStorage = [];
  $scope.GameObjects = [];
  populateData();


  // Should probably encapsulate this in a service?
  // Actually, this html is being reloaded each time...
  // This just seems inefficient to do it this way though
  function populateData() {
    // TESTING LOOP TODO REMOVE
    chrome.storage.sync.get(null, function(obj) {
      for (key in obj) {
        console.log(key + ": " + obj[key]);
      }
    });


    getStorage("user");
    getStorage("packStorage");
    getStorage("homeStorage");
    getStorage("GameObjects");
  }


  function getStorage(key) {
    function storagePromise(key) {
      var defer = $q.defer();
      chrome.storage.sync.get(key, function(obj) {
        defer.resolve(obj);
      });
      
      return defer.promise;
    }

    storagePromise(key).then(function(result) {
      $scope[key] = result[key];
    });
  }



  // This is all the logic for the buttons
  // Will basically handle the highlighting and will append classes for later processing
  $scope.toggleButton = function(action) {
    var packElms = angular.element(document.getElementsByClassName("pack"));
    var homeElms = angular.element(document.getElementsByClassName("home"));

    if (action == "stash" || action == "combine") {
      packElms.toggleClass(action);
      if (packElms.hasClass(action)) {
        homeElms.removeClass("pull");
        packElms.removeClass("stash");
        packElms.removeClass("combine");
        packElms.addClass(action);
      }
    }
    if (action == "pull") {
      homeElms.toggleClass(action);
      if (homeElms.hasClass(action)) {
        packElms.removeClass("stash");
        packElms.removeClass("combine");
      }
    }
  }

  // TODO encapsulate better
  // This runs when an item button is pressed
  $scope.itemAction = function(idx, e) {
    var elm = angular.element(e.target);
    console.log(idx + " clicked");
    if (elm.parent().hasClass("stash")) {
      console.log("stashing");
      $scope.stash();
      
      chrome.storage.sync.get(null, function(obj) {
        var item = $scope.items[idx];
        delete item["storage"];
        // Remove the object
        var index = 0;
        for (objIdx in obj["packStorage"]) {
          if (obj["packStorage"][objIdx].name == item.name) {
            // item = JSON.parse(JSON.stringify(obj["packStorage"][objIdx]));
            index = objIdx;
          }
        }
        obj["packStorage"].splice(index, 1);
        obj["homeStorage"].push(item);
        obj["user"]["numStores"] = obj["user"]["numStores"] - 1;
        if (obj["user"]["numStores"] == 0) {
          // TODO More hacks
          angular.element(document.getElementById("stasher")).prop('disabled', true);
        }

        chrome.storage.sync.set(obj, function() {
          getItems();
        });
      });
    }
    if (elm.parent().hasClass("pull")) {
      console.log("equipping");
      $scope.pull();
      
      chrome.storage.sync.get(null, function(obj) {
        var item = $scope.items[idx];
        delete item["storage"];
        // Remove the object
        var index = 0;
        for (objIdx in obj["homeStorage"]) {
          if (obj["homeStorage"][objIdx].name == item.name) {
            // item = JSON.parse(JSON.stringify(obj["packStorage"][objIdx]));
            index = objIdx;
          }
        }
        obj["homeStorage"].splice(index, 1);
        obj["packStorage"].push(item);
        obj["user"]["numPulls"] = obj["user"]["numPulls"] - 1;
        if (obj["user"]["numPulls"] == 0) {
          // TODO More hacks
          angular.element(document.getElementById("puller")).prop('disabled', true);
        }

        chrome.storage.sync.set(obj, function() {
          getItems();
        });
      });
    }
    if (elm.parent().hasClass("combine")) {
      elm.parent().toggleClass("inCombo");

      var combos = document.getElementsByClassName("inCombo");
      console.log(combos.length);
      if (combos.length == 0) {
        $scope.comboHelper = -1;
      }
      if (combos.length == 1) {
        $scope.comboHelper = idx;
      }
      // TODO this could be optimized... a lot ...
      if (combos.length == 2) {
        $scope.combine();
        var indexOne = $scope.comboHelper;
        var indexTwo = idx;
        if ($scope.comboHelper > idx) {
          indexOne = idx;
          indexTwo = $scope.comboHelper;
        }

        

        chrome.storage.sync.get(null, function(obj) {
          // Would be cool to do a fadeout here
          // This removes the specific item from the object
          angular.element(combos).removeClass("inCombo");
          var elmOne = $scope.items[$scope.comboHelper];
          delete elmOne["storage"];
          var elmTwo = $scope.items[idx];
          delete elmTwo["storage"];
          $scope.comboHelper = -1;
          var newElm = null;

          // Iterate over the game objects to see a combination exists for them
          // TODO should probably move combinations out of gameobj nest
          //      I don't know of that is the most efficient storage
          for (gameObjIdx in gameObjects) {
            var gameObj = gameObjects[gameObjIdx];
            if (gameObj.name == elmOne.name) {
              for (combIdx in gameObj.combinations) {
                if ((gameObj.combinations[combIdx].inputs[0] == elmOne.name
                        && gameObj.combinations[combIdx].inputs[1] == elmTwo.name)
                    || (gameObj.combinations[combIdx].inputs[0] == elmTwo.name
                        && gameObj.combinations[combIdx].inputs[1] == elmOne.name)) {
                  newElm = gameObj.combinations[combIdx].result;
                  console.log("Match Found");
                }
              }
            }
            // Unnecessary
            // if (gameObj.name == elmTwo.name) {}
          }



          // If the new object exists in game objects then populate it
          // Else the new object is trash
          // TODO the trash selection also isn't very efficient
          var trash = null;
          for (gameObjIdx in gameObjects) {
            var gameObj = gameObjects[gameObjIdx];
            if (gameObj.name == newElm) {
              // Is this just the full object?
              console.log("Populating Object");
              newElm = {};
              newElm.name = gameObj.name;
              newElm.value = gameObj.value;
              newElm.attack = gameObj.attack;
              newElm.icon = gameObj.icon;
              newElm.combinations = gameObj.combinations
            }
            if (gameObj.name == "Trash") {
              trash = {};
              trash.name = gameObj.name;
              trash.value = gameObj.value;
              trash.attack = gameObj.attack;
              trash.icon = gameObj.icon;
              trash.combinations = gameObj.combinations
            }
            // Not necessary
            // if (gameObj.name == elmTwo.name) {}
          }

          // If no combinations then you get garbage
          if (newElm == null) newElm = trash;


          console.log(indexOne);
          console.log(indexTwo);
          // This order matters. If indexOne is less and before it messes up indexTwo
          obj["packStorage"].splice(indexTwo, 1);
          obj["packStorage"].splice(indexOne, 1);
          obj["packStorage"].push(newElm);
          obj["user"]["numCombines"] = obj["user"]["numCombines"] - 1;
          if (obj["user"]["numCombines"] == 0) {
            // TODO More hacks
            angular.element(document.getElementById("combiner")).prop('disabled', true);
          }

          chrome.storage.sync.set(obj, function() {
            getItems();
          });
        });
      }
    }
  }
});
