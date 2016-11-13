var app = angular.module("appGui", ['ngMaterial']);
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}]);
app.controller("myCtrl", function($scope) {
  $scope.items = [];
  $scope.chunkedItems = [];
  getItems();
  
  // Should probably encapsulate this in a service?
  // Actually, this html is being reloaded each time...
  // This just seems inefficient to do it this way though
  function getItems() {
    chrome.storage.sync.get("packStorage", function(obj) {
      $scope.items = $scope.items.concat(obj["packStorage"]);
      $scope.chunkedItems = chunk($scope.items)
      $scope.$digest();
    });
    chrome.storage.sync.get("homeStorage", function(obj) {
      $scope.items = $scope.items.concat(obj["homeStorage"]);
      $scope.chunkedItems = chunk($scope.items)
      $scope.$digest();
    });
  }

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
});
