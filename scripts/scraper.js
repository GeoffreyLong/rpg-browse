// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API 
// TODO Try to make this async
//      We want each button to pop up after it has been scraped
//      Right now they all populate at once after all execution
//
//
//
//
// TIMING (Rough Estimates) V1
//    Wikipedia (Heavy Metals): 15292, 16331, 14801, 16063, 14672 => 15431
//    Lipsum.com: 788, 1058, 658, 810, 696                        => 802
// TIMING (Rough Estimates) V2
//    Wikipedia (Heavy Metals): 507, 641, 520, 599, 565           => 566 
//    Lipsum.com: 44, 108, 65, 64, 80                             => 72   
//    
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
    obj["user"]["xp"] = obj["user"]["xp"] + increase;
    chrome.storage.sync.set({"user": obj["user"]});
  });
})(50);


// Populate keywords
// Then run the scraper
chrome.storage.sync.get("keywords", function(obj) {
  keywords = obj["keywords"];
  console.log(obj);
  runScraper();
});

// The button data will be the keyword object that is matched
var handler = function(e){
  e.stopPropagation();
  e.preventDefault();
  var actionIndex = $(this).attr('id');
  console.log('Clicked idx ' + actionIndex);
  port.postMessage(keywords[actionIndex]);
}

// Run scraper
// This will match the keywords with the page text
// Will also create the necessary buttons
function runScraper() {
  var t0 = performance.now();

  var elms = $('body').find('*:not([href]):not("script")')
                      // Will filter to be just unbroken text greater than 10 words
                      .contents().filter(function() {
                        return (this.nodeType === 3 && $(this).text().split(/\s+/).length > 10);
                      }).each(function(idx, elm) {
                        // Gets the value of the filtered text node
                        // Checks if it contains a keyword
                        // If it does, then replace the text by accessing the parent element
                        var textString = elm.nodeValue;
                        for(var i = 0; i < keywords.length; i++){
                          if (textString.match(new RegExp(keywords[i].word, 'ig'))) {
                            try {
                              textString = textString.replace(new RegExp(keywords[i].word, "ig"),
                                                    "<button class='dynButton' id='"+i+"'> " 
                                                    + keywords[i].word + " </button>");
                              $(elm.parentNode).html($(elm.parentNode).html().replace(elm.nodeValue, textString));
                            }
                            catch(err) {}
                          }
                        }
  });
 

  // Might be better performance than $('.dynButton').click
  var time = performance.now() - t0;
  console.log("TIME: " + time);
  $('body').on('click', '.dynButton', handler);
}


