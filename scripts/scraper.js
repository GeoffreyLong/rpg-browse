// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO 
//    Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API 
console.log("Scraper Running");
var keywords = [];
var itemStorage = [];

// Populate keywords
// Then run the scraper
chrome.storage.sync.get("keywords", function(obj) {
  keywords = obj["keywords"];
  console.log(obj);
  runScraper();
})



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
  
  var elms = $('body').find('*').filter(function() {
    return ($(this).children().length == 0 && $(this).text().split(/\s+/).length > 4);
  });
  console.log(elms);
  /*
  var elms = $('body').find('*').filter(function() {
    var str = '';
    $(this).contents().each(function() {
        if (this.nodeType == 3) {
            str += this.textContent || this.innerText || '';
        }
    });

    return str.split(/\s+/).length > 15;
  })
  console.log(elms);
  */
  console.log(recurScraper($('body')));

  for(var i = 0; i < keywords.length; i++){
    $("body:not([href]):not(:image)").html($("body:not([href]):not(:image)").html().replace(new RegExp(keywords[i].word, "ig"),"<button class='dynButton' id='"+i+"'> " + keywords[i].word + " </button>"));
    console.log("Ran it " + i);
  }

  $(".dynButton").click(handler);
}

/*
function recurScraper(elm) {
  if (elm.children().length == 0) {
    return elm;
  }
  else {
    var elms = [];
    elm.children().each(function() {
      elms.push(recurScraper(this));
    });
    return elms;
  }
}
*/
// The button data will be the keyword object that is matched
function handler(){
  var actionIndex = $(this).attr('id');
  port.postMessage(keywords[actionIndex]);
}
