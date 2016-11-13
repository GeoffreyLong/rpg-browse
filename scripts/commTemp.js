var port = chrome.runtime.connect({name: "scraper"});
port.postMessage({
  action: "gather",
  word: "sword"
});


port.onMessage.addListener(function(msg) {
  if (msg.response == "Success") {
    alert(msg.message);
    console.log(msg.message);
  }
  else if (msg.response == "Error") {
    alert(msg.message);
    console.log(msg.message);
  }
});
