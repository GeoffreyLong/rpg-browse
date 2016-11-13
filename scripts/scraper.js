// This is a content script (isolated environment)
//    It will have partial access to the chrome API
// TODO 
//    Consider adding a "run_at": "document_end" in the manifest... 
//      don't want to run before full load
//      Might also be able to do this via the chrome API  
console.log("Scraper Running");

// This will hold all of the scraping logic
// Will also create the necessary buttons
(function() {
  function runScraper() {
    console.log($('body'));

    // Scrape the crap out of the page here
    // Inject buttons when necessary
    //    Make calls to createResourceButton or createActionButton
    // Be disruptive
    // Make money
    // Change the world
  }

  function createResourceButton() {
    // Programatically create a button here

    // Really want to return the button
    return null;
  }
  function createActionButton() {
  }


  runScraper();
})();


// TODO create the functions that the buttons will call
//      These will pass data to the chrome extension (see message passing)
//      Or we can consider a hack like this http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script

