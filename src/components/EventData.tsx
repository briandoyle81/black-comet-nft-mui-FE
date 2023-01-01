
export interface EventDataDisplay {
    name: string,
    desc: string,
    id: number
}

const TileEventDisplayData: EventDataDisplay[] = [];
const BugEventDisplayData: EventDataDisplay[] = [];
const MysteryEventDisplayData: EventDataDisplay[] = [];
const ScavEventDisplayData: EventDataDisplay[] = [];
const ShipEventDisplayData: EventDataDisplay[] = [];

// TODO: CRITICAL -> Break assumption that order in array == correct
TileEventDisplayData.push({
    name: "No Event",
    desc: "Nothing Happens.",
    id: 200000
})

TileEventDisplayData.push({
    name: "Breached Reactor",
    desc: "As you enter the room, the reactor explodes!  Take 1 hazard damage.",
    id: 200001
})

TileEventDisplayData.push({
    name: "Bug Nest",
    desc: "As an action, attempt to harvest an egg.  Roll a die.  On a 6, take an egg token.  On a 1 or 2, take 1 physical damage and place a bug alien in the room.",
    id: 200002
})

TileEventDisplayData.push({
    name: "Crossroads",
    desc: "You've crashed a party!  Place 3 scavengers in this room.",
    id: 200003
})

TileEventDisplayData.push({
    name: "Engineering Catwalk",
    desc: "As an action, jump down to the Reactor Room, exploring if unexplored.",
    id: 200004
})

TileEventDisplayData.push({
    name: "Hull Breach",
    desc: "As you enter the room, a wall buckles and explodes into space! You desperately try to grab on to something to save yourself!  (Roll a die)",
    id: 200005
})

TileEventDisplayData.push({
    name: "Medbay",
    desc: "If there are no hostiles in this room, as an action, return to full health +1",
    id: 200006
})

TileEventDisplayData.push({
    name: "Showers",
    desc: "As you explore this room, a horde of small bugs emerge from the drains.  They get inside your suit, biting and stinging.  Take 1 hazard damage.",
    id: 200007
})

TileEventDisplayData.push({
    name: "Trash Compactor",
    desc: "As you enter, the doors slam shut and the trash compactor comes to life!  In three turns, everything in the room will be destroyed!",
    id: 200008
})

// BUG Events

BugEventDisplayData.push({
    name: "No Event",
    desc: "Nothing Happens.",
    id: 300000
})

BugEventDisplayData.push({
    name: "There's Something in the Walls",
    desc: "A chittering sound signals the arrival of company.\n\nPlace a Bug Alien in your current room.",
    id: 300001
})

BugEventDisplayData.push({
    name: "Something Bit Me",
    desc: "You step on a small Bug Alien. It bites you before running away.\n\nTake 1 damage.",
    id: 300002
})

BugEventDisplayData.push({
    name: "Game Over Man, Game Over!",
    desc: "They're too many bugs. They're in the walls, they're in the ceiling. You just can't take it anymore.\n\nLose the rest of this turn.",
    id: 300003
})

BugEventDisplayData.push({
    name: "Packrat",
    desc: "A bug knocks you over, takes one of your items, and disappears into a vent.\n\nDiscard a random item card.",
    id: 300004
})

BugEventDisplayData.push({
    name: "What is this stuff?",
    desc: "You slip and fall into some sort of foul, sticky excretion. It covers your clothes and makes it difficult to walk. At least you smell like the bugs now.\n\nKeep this card.  As an action, you may discard it after using ship services, or while in the Scullery, Galley, or Showers.\n\-1 to all rolls.\n\nBugs ignore you.",
    id: 300005
})

BugEventDisplayData.push({
    name: "Packrat Nest",
    desc: "You find the nest of a packrat bug. Most of the stuff is broken, but you see something shiny in the back.\n\nDraw 2 item cards.",
    id: 300006
})

BugEventDisplayData.push({
    name: "Clever Girls",
    desc: "While rummaging around the room you hear an aggressive bark and realize you've been outwitted by insects!\n\nPlace 2 Bug Aliens in the room you just left.",
    id: 300007
})

BugEventDisplayData.push({
    name: "Warrior",
    desc: "Bones, shells, and rotting flesh are strewn around this room. You hear a guttural growl and a large figure rises in the corner.\n\nPlace a Bug Alien in the room.",
    id: 300008
})

BugEventDisplayData.push({
    name: "Good Girl!",
    desc: "A small bug with wiggly antennae bounds up to you. With a happy bark, she deposits something at your feet before scampering off.\n\nDraw a card from the item deck.",
    id: 300009
})

BugEventDisplayData.push({
    name: "What's that smell?",
    desc: "You accidentally step on some kind of Bug Alien pouch. It ruptures and a foul yellow substance oozes out. It's by far the worst thing you've ever smelled in your entire life. You heave over gagging.\n\nTake 1 hazard damage. Place a Hazard Token in this room.",
    id: 300010
})

BugEventDisplayData.push({
    name: "Spider's Web",
    desc: "You come a piece of equipment tangled in a large web.\n\nRoll a die:\n\n1:    A Bug Alien snatches the item away and another appears to fight you. Place a Bug Alien in the room.\n\n2-5: You've retrieved the item, but attracted company. Draw an item card from the deck and place a Bug Alien in the room.\n\n6:    Success! You carefully extract the item without disturbing the web. Draw a card from the item deck.",
    id: 300011
})

BugEventDisplayData.push({
    name: "Something is following me...",
    desc: "You keep hearing noises behind you, but don't see anything. You duck through a doorway, then look back. You were right, you're being hunted!\n\nPlace a Bug Alien in the room you just left.",
    id: 300012
})

BugEventDisplayData.push({
    name: "Sneak Attack",
    desc: "As you carefully explore the room, a Bug Alien pounces!\n\nTake 1 damage.\n\nPlace a Bug Alien in the room.",
    id: 300013
})

BugEventDisplayData.push({
    name: "Feeding Time",
    desc: "You see a horrifying site. A Bug Alien is feasting on a dead Scavenger. Your hopes that the bug is full are dashed when it turns to you and charges.\n\nPlace a Bug Alien in the room.\n\nPlace an item card face down in the room.",
    id: 300014
})

BugEventDisplayData.push({
    name: "Pardon m----aaaaah!",
    desc: "You walk through the doorway and bump right into a Bug Alien. You yelp and jump backwards.\n\nReturn to the room you just left.\n\nPlace a Bug Alien in the room you just discovered.",
    id: 300015
})


MysteryEventDisplayData.push({
    name: "No Event",
    desc: "Nothing happens.",
    id: 400000
})

MysteryEventDisplayData.push({
    name: "No Event",
    desc: "Nothing happens.",
    id: 400000
})

MysteryEventDisplayData.push({
    name: "Mesmer",
    desc: "You see a shimmer in the corner of your eye. As you turn, it transforms into a beautiful pattern of scintillating colors. Enchanted, you stare at the wonder. It seems to be trying to tell you something. You become lost. The truth seem so close, but something prevents you from seeing it. Finally, you tear yourself away, knowing that all the answers you have ever sought remain just out of reach.\n\nLose the rest of your turn.",
    id: 400001
})

MysteryEventDisplayData.push({
    name: "Portal",
    desc: "A hole in reality floats in the corner. Looking inside, you see fleeting glimpses of other parts of the ship. Every once in awhile, you catch a glimpse of a nightmare scene with people on fire, having their skin torn off in strips.\n\nPlace the Portal Token in this room. As an action, jump in. Roll two dice:\n\n2:      Die immediately, and discard your items.3-8:   Teleport to the Donghaiju.\n\n9-12: Teleport to any discovered room.",
    id: 400002
})

MysteryEventDisplayData.push({
    name: "The Kirk Method",
    desc: "You enter the room and discover a green skinned alien that is very, very attractive. Even better, it seems...receptive. You spend the rest of your turn engaging in diplomatic negotiations.\n\nRoll two dice:\n\n2-3: Eww, you have contracted space herpes. -1 to all rolls.\n\n4-11: A restful nap. You feel great. Return to full health.\n\n12: You feel amazingly vigorous. Return to full health +1.",
    id: 400003
})

MysteryEventDisplayData.push({
    name: "Brownie",
    desc: "You encounter a small humanoid creature. It squeaks and gestures at your equipment.\n\nDiscard an item and draw a new one from the deck.\n\n-OR-\n\nDo not give the brownie an item. It stabs you in the foot and runs off. Take 1 physical damage.",
    id: 400004
})

MysteryEventDisplayData.push({
    name: "I gotta get out of here!",
    desc: "You see a window and realize you've got to get outside. Before you know what you're doing, you're running full speed towards escape. Luckily, 12 inches of crystal sapphire glass are stronger than your face.\n\nMove to the closest discovered window. If there aren't any within 6 tiles, sit down and cry instead.\n\nTake 1 physical damage.",
    id: 400005
})

MysteryEventDisplayData.push({
    name: "Incident Boundary",
    desc: "You receive a message from the beyond. It's garbled at first, but then it shows you what to do. With clear purpose, you pull out your knife and go to work on your flesh. When you're done, you're different. Better. You finally belong.\n\nTake 1 damage.\n\n+1 to actions (until you die).",
    id: 400006
})

MysteryEventDisplayData.push({
    name: "Fugue State",
    desc: "The world takes on a dreamlike quality as your mind blanks out. While you drift into darkness, it is almost as if someone else is taking control of your body.\n\nEach other player rolls a die. The highest roller finishes your turn in the manner of their choosing. They may perform any legal action except respawning.",
    id: 400007
})

MysteryEventDisplayData.push({
    name: "Horror",
    desc: "A terrifying phantasm rises out of the floor and points at you. Your blood turns to ice and your mind blanks in panic. You drop everything and flee.\n\nDrop everything you are carrying in your current room. Move six rooms towards the Donghaijiu, automatically breaching any doors.",
    id: 400008
})

MysteryEventDisplayData.push({
    name: "Voices",
    desc: "The ship is speaking to you. You understand it now. It loves you and wants to help you.\n\n+1 to hack door rolls.",
    id: 400009
})

MysteryEventDisplayData.push({
    name: "The Lottery",
    desc: "You watch in horror as ghostly figures appear in this room. Haggard and starving, they appear to be drawing straws for something. Suddenly, the ghost handing out the straws looks at you and holds out her hand for you to draw.\n\nRoll a die. Die instantly if you roll a 1.",
    id: 400010
})

MysteryEventDisplayData.push({
    name: "Missing Numbers",
    desc: "It's all about the numbers. They're hiding one from you. You think it might be between 5 and 6. There's another one in there, you're sure of it.\n\nRoll a die:\n\n1: Go mad. -1 Action.\n\n2-5: You can't find it. Nothing happens.\n\n5.5: Become a living god.\n\n6:    Get +1 Action.",
    id: 400011
})

MysteryEventDisplayData.push({
    name: "Tesseract",
    desc: "As you enter the room, space folds around you. Up, down, left, right, inside, and out. All swap places, twisting reality and bending space and time. You are trapped!\n\nAs an action, roll a die. If you roll 4-6, you escape this mind-bending experience.",
    id: 400012
})

MysteryEventDisplayData.push({
    name: "Glitch in the Spaceship",
    desc: "Your PDA screen blips out for a moment. When the view comes back, it's showing the Donghaijiu as being in a completely different location. Oddly, everyone else seems to think that it's in the same place as it was when you arrived. Weird, but at least it's in a more convenient place now.\n\nMove the Donghaijiu and anyone in it to the legal placement of your choice.",
    id: 400013
})

MysteryEventDisplayData.push({
    name: "Ephemeral Form",
    desc: "A strange energy field fills the room and strikes you!  It doesn't appear to have hurt you, but you feel slightly out of phase with everything else.  Hopefully the medbay on the ship can fix you.\n\nUntil you next use ship services, you may not do anything but move.\n\nYou cannot be harmed.\n\nYou may move through doors as if they are not there, and may use the continue rule, even if there is a hostile in a room.",
    id: 400014
})

MysteryEventDisplayData.push({
    name: "TISATAAFL",
    desc: "You suddenly notice a strange package in one of your pockets.  Inside is a delicious sandwich.  Even better, it came with a prize!\n\nReturn to full health +1.\n\nDraw an item card.",
    id: 400015
})

ScavEventDisplayData.push({
    name: "No Event",
    desc: "Nothing Happens",
    id: 500000
})

ScavEventDisplayData.push({
    name: "Crazed Prophet",
    desc: "A woman with wild hair and a dirty robe starts gibbering about your destiny. She pushes something into your hands then runs away down the corridor.\n\nDraw an item from the item deck.",
    id: 500001
})

ScavEventDisplayData.push({
    name: "Blackjack",
    desc: "A blow from behind knocks you over. Through the haze, you see a grizzled Scavenger pawing through your belongings. By the time you recover, the Scavenger has run off.\n\nTake 1 damage and discard one item at random.",
    id: 500002
})

ScavEventDisplayData.push({
    name: "Toll",
    desc: "A large and well-armed Scavenger has taken control of this room. He demands you pay a toll to pass.\n\nDiscard one item for free passage\n\n-OR-\n\nThe Scavenger becomes hostile and attacks. Take 1 physical damage. Place a Scavenger in this room.",
    id: 500003
})

ScavEventDisplayData.push({
    name: "Bear Trap",
    desc: "You see a beautiful alien artifact! Unable to contain your excitement, you run over and grab it. With a snap, a metal device clamps down on your leg. You are trapped! Even worse, the artifact is just a hollow shell.\n\nYou may not move.  As an action, roll a die:\n\n1:    Place a Scavenger in the room.\n\n2-3: Lose this action.\n\n4-6: You successfully free yourself.",
    id: 500004
})

ScavEventDisplayData.push({
    name: "Cooking Badly",
    desc: "You come across two Scavengers that are in the middle of cooking some sort of foul chemical compound. They see you and scramble out of the room, knocking over their stove in the process.\n\nPlace a hazard token in this room.",
    id: 500005
})

ScavEventDisplayData.push({
    name: "Garbage Collection",
    desc: "It looks like a Scavenger has been collecting scrap in this room. Luckily, they're not around. It's yours to take.\n\nDraw 2 items from the item deck.",
    id: 500006
})

ScavEventDisplayData.push({
    name: "You scratch my back...",
    desc: "A voice whispers from the shadows, 'You scratcher my back, I scratcher yours. Gimmes summin shiny and I'll get you summun else's shiny.'\n\nYou may discard one item to take an item at random from another player. If you choose not to do this, the Scavenger vanishes.",
    id: 500007
})

ScavEventDisplayData.push({
    name: "Bully",
    desc: "A large Scavenger is in this room. He looks at you and says, 'Well, well. Another weakling. You better gimme your lunch money, punk!'\n\nGive up and discard an item.\n\n-OR-\n\nThrow a punch. Take 1 physical damage from the scuffle and the bully runs off.",
    id: 500008
})

ScavEventDisplayData.push({
    name: "Arm Rassling",
    desc: "A beefy Scavenger invites you to take a seat across from her. 'You got what it takes?'\n\nArm wrestle! Wager an item card and roll a die. On a 4-6, keep your wager and draw another item card. Otherwise, discard your wager.\n\n-OR-\n\nRefuse. The Scavenger becomes enraged by your cowardice. Place a Scavenger in this room.",
    id: 500009
})

ScavEventDisplayData.push({
    name: "Hitman",
    desc: "A tall, bald Scavenger steps out of the shadows, and holds up a strange device. He states flatly, 'We can speak freely. Your ship can't hear us now. I can thin out the competition. Payment in hard assets only.'\n\nDiscard an artifact. Pick another player. That player dies instantly.\n\n-OR-\n\nDecline offer.  The hitman vanishes back into the shadows.",
    id: 500010
})

ScavEventDisplayData.push({
    name: "Mad Mel",
    desc: "This room contains a completely psychotic Scavenger with a funny voice. He attacks immediately.\n\nTake 1 physical damage. Place a Scavenger in the room.",
    id: 500011
})

ScavEventDisplayData.push({
    name: "Scavangus Interruptus",
    desc: "You enter the room and interrupt two Scavengers that seem to me in the middle of some sort of unpleasant courtship ritual. They are quite upset by your interference.\n\nPlace 2 Scavengers in this room.",
    id: 500012
})

ScavEventDisplayData.push({
    name: "I'm sleeping here!",
    desc: "You wake a Scavenger from a nap in a pile of trash. She's not happy about it.\n\nPlace 1 Scavenger in this room.",
    id: 500013
})

ScavEventDisplayData.push({
    name: "I'm not following you!",
    desc: "You hear a bump, a large clatter, and an impressive stream of profanity. Sounds like an idiot is trying to follow you.\n\nPlace 1 Scavenger in the room you just left.",
    id: 500014
})

ScavEventDisplayData.push({
    name: "You Are Not Alone",
    desc: "You've found yourself in a rather populated part of the ship. It seems like there are Scavengers all over the place.\n\nPlace one Scavenger in each adjacent room.",
    id: 500015
})

export { TileEventDisplayData, BugEventDisplayData, MysteryEventDisplayData, ScavEventDisplayData, ShipEventDisplayData }
