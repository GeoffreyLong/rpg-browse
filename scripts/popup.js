var app = angular.module("appGui", []);
app.controller("myCtrl", function($scope) {
  $scope.items = [];
  getItems();
  
  // Should probably encapsulate this in a service?
  function getItems() {
    chrome.storage.sync.get("packStorage", function(obj) {
      $scope.items = $scope.items.concat(obj["packStorage"]);
      $scope.$digest();
    });
    chrome.storage.sync.get("homeStorage", function(obj) {
      $scope.items = $scope.items.concat(obj["homeStorage"]);
      $scope.$digest();
    });
  }
});
