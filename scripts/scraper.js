// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO 
//    Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API 
console.log("Scraper Running");
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

  function createStorageButton()
  {

  }
  function createActionButton() {
  }

  



  runScraper();
})();


// TODO create the functions that the buttons will call
//      These will pass data to the chrome extension (see message passing)
//      Or we can consider a hack like this http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script

