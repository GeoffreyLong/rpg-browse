// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO 
//    Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API 
console.log("Scraper Running");
<<<<<<< HEAD
var keywords = ["sword", "gold", "yellow", "blue", "green", "china", "civil", "state"];
var itemStorage = [ ];

// This will match the keywords with the page text
// Will also create the necessary buttons
(function() {
  function runScraper() {
    console.log($('body'));
     for(var i = 0; i < keywords.length; i++){
     $("body:not([href]):not(:image)").html($("body:not([href]):not(:image)").html().replace(new RegExp(keywords[i], "ig"),"<button onclick = "buttonInfo()"> " + keywords[i] + " </button>"));
     console.log("Ran it " + i);
  }

  }


  function getButtonInfo(){
    itemStorage.push($('button.text').text());  

    
  }
=======
var keywords = [];
var itemStorage = [];

// Populate keywords
// Then run the scraper
chrome.storage.sync.get("keywords", function(obj) {
  keywords = obj["keywords"];
  console.log(obj);
  runScraper();
})

>>>>>>> ecce9c786cdd08c0a4711fa4af3f662c7fb8d0fa

  function createStorageButton()
  {

// Open port for communications
var port = chrome.runtime.connect({name: "scraper"});
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



// Run scraper
// This will match the keywords with the page textx
// Will also create the necessary buttons
function runScraper() {
  console.log($('body'));
  for(var i = 0; i < keywords.length; i++){
    $("body:not([href]):not(:image)").html($("body:not([href]):not(:image)").html().replace(new RegExp(keywords[i].word, "ig"),"<button onclick='" + buttonAction(keywords[i]) + "'> " + keywords[i].word + " </button>"));
    console.log("Ran it " + i);
  }

}


// The button data will be the keyword object that is matched
function buttonAction(buttonData){
  port.postMessage(buttonData);
}
