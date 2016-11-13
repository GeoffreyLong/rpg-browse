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

    var wordArray = [" "];
    var paragraphText = $('body').find(":not(script)");
    var tags = ["2"];

    /*
    for(var i =0; i < paragraphText.length; i++)
    {
      tags.push(findDeepestChild(paragraphText[i]));
      wordArray.push(paragraphText[i].innerText.split("/\W/"));
      if (paragraphText[i].innerText.length > 7 )
      {
          var inHtml = $(paragraphText[i]).html();
          if (inHtml) {

            /*
        console.log(inHtml);
          var button = "</p>" + "<button> civil </button>" + "<p>";
          
          $(paragraphText[i]).html(inHtml.replace(/civil/gi, button));
          


          }
      }
    }
    */
    
    for(var i =0; i < paragraphText.length; i++)
    {
      tags.push(findDeepestChild(paragraphText[i]));
    }

    for(var i = 0; i < tags.length; i++)
    {

      wordArray.push(tags[i].element);
    }

   



    console.log(tags);  
    console.log(paragraphText);
    console.log(wordArray);

  }

  function createResourceButton() {
    // Programatically create a button here

    // Really want to return the button
    return null;
  }
  function createActionButton() {
  }

  function findDeepestChild(parent) {

    var result = {depth: 0, element: parent};

    $(parent) .children().each(
        function(idx) {
            var child = $(this);
            var childResult = findDeepestChild(child);
            if (childResult.depth + 1 > result.depth) {
                result = {
                    depth: 1 + childResult.depth, 
                    element: childResult.element};
            }
        }
    );

    return result;
}



  runScraper();
})();


// TODO create the functions that the buttons will call
//      These will pass data to the chrome extension (see message passing)
//      Or we can consider a hack like this http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script

