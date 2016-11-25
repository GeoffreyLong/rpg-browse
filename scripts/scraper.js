// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API 
// TODO Try to make this async
//      We want each button to pop up after it has been scraped
//      Right now they all populate at once after all execution
console.log("Scraper Running");
var keywords = [];
var itemStorage = [];

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


// Increase the XP by 50 for the page visit
(function(increase) {
  chrome.storage.sync.get("user", function(obj) {
    var newXP = obj["user"]["xp"] + increase;
    chrome.storage.sync.set({"user": newXP});
  });
})(50);


// Populate keywords
// Then run the scraper
chrome.storage.sync.get("keywords", function(obj) {
  keywords = obj["keywords"];
  console.log(obj);
  runScraper();
});


// Run scraper
// This will match the keywords with the page text
// Will also create the necessary buttons
function runScraper() {
  console.log($('body'));
  
  var elms = $('body').find('*:not([href]):not("script")').filter(function() {
    return ($(this).children().length == 0 && $(this).text().split(/\s+/).length > 10);
  });
  console.log(elms);

  for(var i = 0; i < keywords.length; i++){
    $("body:has(p)").html($("body:has(p)").html().replace(new RegExp(keywords[i].word, "ig"),"<button class='dynButton' id='"+i+"'> " + keywords[i].word + " </button>"));
    console.log("Ran it " + i);

  }


  $(".dynButton").click(handler);
}


// The button data will be the keyword object that is matched
function handler(e){
  e.stopPropagation();
  e.preventDefault();
  var actionIndex = $(this).attr('id');
  port.postMessage(keywords[actionIndex]);
}
