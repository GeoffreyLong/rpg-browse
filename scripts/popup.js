var app = angular.module("appGui", ['ngMaterial']);
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}]);
app.controller("myCtrl", function($scope) {
  // Would be best just to have one items and then the storage flag
  $scope.items = [];
  $scope.chunkedItems = [];
  $scope.user = {};
  getItems();
  
  // Should probably encapsulate this in a service?
  // Actually, this html is being reloaded each time...
  // This just seems inefficient to do it this way though
  function getItems() {
    $scope.items = [];
    $scope.user = {};
    chrome.storage.sync.get("packStorage", function(obj) {
      for (item in obj["packStorage"]) {
        obj["packStorage"][item]["storage"] = "pack";
      }
      $scope.items = $scope.items.concat(obj["packStorage"]);
      // $scope.chunkedItems = chunk($scope.items)
      $scope.$digest();
    });
    chrome.storage.sync.get("homeStorage", function(obj) {
      for (item in obj["homeStorage"]) {
        obj["homeStorage"][item]["storage"] = "home";
      }
      $scope.items = $scope.items.concat(obj["homeStorage"]);
      // $scope.chunkedItems = chunk($scope.items)
      $scope.$digest();
    });
    chrome.storage.sync.get("health", function(obj) {
      $scope.user.health = obj["health"];
      $scope.$digest();
    });
    chrome.storage.sync.get("xp", function(obj) {
      $scope.user.xp = obj["xp"];
      $scope.$digest();
    });
    chrome.storage.sync.get("numStores", function(obj) {
      $scope.user.numStores = obj["numStores"];
      $scope.$digest();
    });
    chrome.storage.sync.get("numPulls", function(obj) {
      $scope.user.numPulls = obj["numPulls"];
      $scope.$digest();
    });
    chrome.storage.sync.get("numCombines", function(obj) {
      $scope.user.numCombines = obj["numCombines"];
      $scope.$digest();
    });
  }

  /*
  function chunk(arr) {
    var size = 5;
    console.log(window.innerWidth);
    if (window.innerWidth > 1500) {
      size = 5;
    }

    var newArr = [];
    for (var i = 0; i < size; i += size) {
      var tempArr = [];
      for (var j = i; j < arr.length; j += 1) {
        tempArr.push(arr[j]);
      }
      newArr.push(tempArr);
    }
    return newArr;
  }
  */


  $scope.stash = function() {
    console.log("stash");
    var elm = document.getElementsByClassName("pack");
    angular.element(elm).toggleClass("stash");
  }
  $scope.pull = function() {
    console.log("pull");
    var elm = document.getElementsByClassName("home");
    angular.element(elm).toggleClass("pull");
  }
  $scope.combine = function() {
    console.log("combine");
    var elm = document.getElementsByClassName("pack");
    angular.element(elm).toggleClass("stash");
  }
  
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
        obj["numStores"] = obj["numStores"] - 1;
        if (obj["numStores"] == 0) {
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
        obj["numPulls"] = obj["numPulls"] - 1;
        if (obj["numPulls"] == 0) {
          // TODO More hacks
          angular.element(document.getElementById("puller")).prop('disabled', true);
        }

        chrome.storage.sync.set(obj, function() {
          getItems();
        });
      });
    }
  }
});
