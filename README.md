# rpg-browse
An RPG gamification of the Chrome browser



App Behaviour:
- On page load call the script we want to run via the Chrome extension call
  - Parse the page text
  - Tokenize into words
  - Compare each word to keyword 
    - We want this to be fast. Perhaps we can hash the word and check to see if it exists in a hash table of keywords we make. 
  - If the word is a keyword
    - Inject a button (to start out just make a hyperlink)
    - If the button is clicked this will call a function 
      - It will run any action that we associate with the button / link. For instance saving the clicked item to the users inventory.
      
      
Game Mechanics:
- Keywords on the page are objects
  - TYPES
    - Resources: These are things like gold, topaz, uranium, potion
    - Weapons: These would be words like sword, gun, etc
  - Recombination
    - You should be able to combine resources to make new ones. 
