// chrome.extension.getBackgroundPage().console.log('foo');

(function() {
  // Clear the cache
  // chrome.storage.sync.clear();

  // Populate the local client with data for the user
  // This is just for the purposes of testing, real users would be saved in chrome storage
  $.getJSON("test/userData.json", function(data) {
    for (key in data) {
      var saveObj = {};
      saveObj[key] = data[key];
      chrome.storage.sync.set(saveObj, saveCallback(key, data[key]));
    }
  });

  function saveCallback(key, data) {
    console.log("Saved user data " + key);
  }
})();
