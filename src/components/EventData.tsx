
interface EventDataDisplay {
    name: string,
    desc: string,
    id: number
}

const TileEventDisplayData: EventDataDisplay[] = [];

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

export { TileEventDisplayData }
