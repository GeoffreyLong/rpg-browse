# rpg-browse
An RPG gamification of the Chrome browser



App Behaviour:
- On page load call the script we want to run via the Chrome extension call
  - Parse the page text
  - Tokenize into words
  - Compare each word to keyword 
    - We want this to be fast. Perhaps we can hash the word and check to see if it exists in a hash table of keywords we make. 
  - If the word is a keyword and it is the first of the keyword found
    - NOTE: We only really want the first one, if "gold" for instance shows up many times we don't want them clicking on it
    - Inject a button (to start out just make a hyperlink)
    - If the button is clicked this will call a function 
      - It will run any action that we associate with the button / link. For instance saving the clicked item to the users inventory.
      
Game Mechanics:
- The user will have two storage areas: user inventory and storage. The storage can be thought of as the users "pack", something they bring with them as they surf the internet. The storage can be thought of as the users "home" which they can save things in. The user will surf the internet, collecting resources, killing enemies, and levelling up. If the user dies, they will lose all non-weapon items in their user inventory. 
- Keywords on the page are objects and actions
  - TYPES
    - Resources: These are things like gold, topaz, uranium, potion
    - Weapons: These would be words like sword, gun, etc
    - Actions: These allow for user actions
    - Enemies: Possibly could do this as well
    - Resources and weapons would be treated the same way, but different than actions and enemies.
  - Recombination
    - You should be able to combine resources to make new ones. 
    - Recombination objects generally should not be found randomly
  - Possible actions
    - "Store", "stash", "save": Move an item from user inventory to storage
    - "Pull", "get": Move an item from storage to user inventory
    - "Upgrade", "Level": Give the user the ability to upgrade their inventory or a weapon if they have enough xp?
    - "Combine": Allow the user to combine different objects


## Game Objects
We will have all resources and weapons as gameObjs. The field damage will be 0 if the item is not a weapon. For now we will not implement type. Later we can add other interesting fields like duration or healing or durability. For the specific weapon attributes, we might want to encapsulate them.
gameObjs = [GameObj]
GameObj = {
  name: String,
  value: Number,
  type: String,
  damage: Number,
  isKeyword: Boolean,
  combinations: [{
    result: GameObj,
    inputs: [GameObj, GameObj]
  }]
}

## KeyWords
These will be the keywords we search for

## User Objects
We need some way of having the users log on. Maybe chrome has a unique id for each user.
User = {
  name: String,
  health: Number,
  packSize: Number,
  packStorage: [{
    name: GameObj.name,
    value: GameObj.value,
    damage: GameObj.damage,
    combinations: GameObj.combinations
  }],
  homeStorage: [{
    name: GameObj.name,
    value: GameObj.value,
    damage: GameObj.damage,
    combinations: GameObj.combinations
  }],
  acheivements: {
    numItemsFound: Number,
    numPagesVisited: Number
  }
}



## Later Implementations
- We will want to prevent the user from reloading the page willy nilly and collecting rare objects. We will probably want to track page loads and times to have a refresh rate for given objects. Common objects will refresh quickly, while valuable objects might take longer. This might be a bit more difficult to track since for each webpage we would have to track each object and when it was collected.
