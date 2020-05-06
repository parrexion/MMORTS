/////////////////////BUILDINGS

const getBuildingCost = (id, level) => {
  let b = getBuilding(id)
  return {
    level,
    grain: level * b.cost.grain,
    apple: level * b.cost.apple,
    honey: level * b.cost.honey,
    meat: level * b.cost.meat,
    time: level * b.buildTime
  }
}

const getBuilding = (id) => {
  for (let i = 0; i < buildings.length; i++) {
    if (buildings[i].id == id)
      return buildings[i]
  }
}

const buildings = [{
  id: 1,
  name: 'Church',
  desc: 'The main building of the village.',
  cost: {
    grain: 80,
    apple: 80,
    honey: 80,
    meat: 10
  },
  production: {
    grain: 10,
    apple: 10,
    honey: 10,
    meat: 5
  },
  buildTime: 90000,
  maxLevel: 20,
  exp: 10,
  img: 'img/church.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}, {
  id: 2,
  name: 'Barn',
  desc: 'Increases the amount of food that can be stored.',
  cost: {
    grain: 250,
    apple: 0,
    honey: 0,
    meat: 30
  },
  production: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 0
  },
  buildTime: 100000,
  maxLevel: 20,
  exp: 5,
  img: 'img/barn.png',
  capacity: { grain: 500, meat: 100, apple: 500, honey: 500, villagers: 0 }
}, {
  id: 3,
  name: 'Windmill',
  desc: 'Increases the grain production of the village.',
  cost: {
    grain: 200,
    apple: 0,
    honey: 0,
    meat: 0
  },
  production: {
    grain: 20,
    apple: 0,
    honey: 0,
    meat: 0
  },
  buildTime: 30000,
  maxLevel: 20,
  exp: 2,
  img: 'img/windmill.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}, {
  id: 4,
  name: 'Houses',
  desc: 'Increases the amount of people in the village.',
  cost: {
    grain: 100,
    apple: 0,
    honey: 0,
    meat: 15
  },
  production: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 0
  },
  buildTime: 45000,
  maxLevel: 20,
  exp: 3,
  img: 'img/village.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 10 }
}, {
  id: 5,
  name: 'Barracks',
  desc: 'Allows you to train soldiers.',
  cost: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 150
  },
  production: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 0
  },
  buildTime: 75000,
  maxLevel: 20,
  exp: 6,
  img: 'img/barracks.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}, {
  id: 6,
  name: 'Market',
  desc: 'Allows you to trade resources with other players.',
  cost: {
    grain: 30,
    apple: 30,
    honey: 30,
    meat: 10
  },
  production: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 0
  },
  buildTime: 75000,
  maxLevel: 20,
  exp: 4,
  img: 'img/barracks.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}, {
  id: 7,
  name: 'Orchard',
  desc: 'Increases your apple production',
  cost: {
    grain: 0,
    apple: 200,
    honey: 0,
    meat: 0
  },
  production: {
    grain: 0,
    apple: 20,
    honey: 0,
    meat: 0
  },
  buildTime: 30000,
  maxLevel: 20,
  exp: 2,
  img: 'img/tree.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}, {
  id: 8,
  name: 'Bee farm',
  desc: 'Increases your honey production',
  cost: {
    grain: 0,
    apple: 0,
    honey: 200,
    meat: 0
  },
  production: {
    grain: 0,
    apple: 0,
    honey: 20,
    meat: 0
  },
  buildTime: 30000,
  maxLevel: 20,
  exp: 2,
  img: 'img/beehive.png',
  capacity: { grain: 0, meat: 0, apple: 0, honey: 0, villagers: 0 }
}]






///////// TROOPS
const getTroop = (id) => {
  for (let i = 0; i < troopLibrary.length; i++) {
    if (troopLibrary[i].id == id)
      return troopLibrary[i]
  }
}

const troopLibrary = [{
  id: 0,
  name: 'Farmer',
  cost: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 0
  },
  upkeep: {
    grain: -1,
    apple: 0,
    honey: 0,
    meat: 0
  },
  stats: {
    attack: 0,
    defense: 0,
    capacity: 10
  },
  buildTime: 30000,
  travelTime: 30,
  description: 'Farmer',
  img: 'img/farmer.png'
}, {
  id: 1,
  name: 'Worker',
  cost: {
    grain: 50,
    apple: 0,
    honey: 0,
    meat: 0
  },
  upkeep: {
    grain: 1,
    apple: 0,
    honey: 0,
    meat: 0
  },
  stats: {
    attack: 0,
    defense: 10,
    capacity: 50
  },
  buildTime: 30000,
  travelTime: 35,
  description: 'Worker',
  img: 'img/basic-worker.png'
}, {
  id: 2,
  name: 'Merchant',
  cost: {
    grain: 0,
    apple: 20,
    honey: 20,
    meat: 0
  },
  upkeep: {
    grain: 0,
    apple: 0,
    honey: 1,
    meat: 0
  },
  stats: {
    attack: 0,
    defense: 15,
    capacity: 100
  },
  buildTime: 75000,
  travelTime: 90,
  description: 'Soldier',
  img: 'img/merchant.png'
}, {
  id: 3,
  name: 'Soldier',
  cost: {
    grain: 15,
    apple: 0,
    honey: 0,
    meat: 25
  },
  upkeep: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 1
  },
  stats: {
    attack: 50,
    defense: 30,
    capacity: 30
  },
  buildTime: 60000,
  travelTime: 45,
  description: 'Soldier',
  img: 'img/basic-soldier.png'
}, {
  id: 4,
  name: 'Spartan',
  cost: {
    grain: 0,
    apple: 30,
    honey: 15,
    meat: 75
  },
  upkeep: {
    grain: 0,
    apple: 0,
    honey: 0,
    meat: 2
  },
  stats: {
    attack: 80,
    defense: 80,
    capacity: 60
  },
  buildTime: 90000,
  travelTime: 50,
  description: 'Stronger warrior than the basic soldier',
  img: 'img/spartan.png'
}, {
  id: 5,
  name: 'Pegasi',
  cost: {
    grain: 125,
    apple: 0,
    honey: 0,
    meat: 0
  },
  upkeep: {
    grain: 0,
    apple: 2,
    honey: 0,
    meat: 0
  },
  stats: {
    attack: 75,
    defense: 15,
    capacity: 60
  },
  buildTime: 120000,
  travelTime: 180,
  description: 'Pegasi',
  img: 'img/pegasus.png'
}, {
  id: 6,
  name: 'Knight',
  cost: {
    grain: 150,
    apple: 25,
    honey: 0,
    meat: 30
  },
  upkeep: {
    grain: 2,
    apple: 0,
    honey: 0,
    meat: 1
  },
  stats: {
    attack: 100,
    defense: 75,
    capacity: 120
  },
  buildTime: 120000,
  travelTime: 120,
  description: 'Knight which is more bulkier than the Pegasi',
  img: 'img/knight.png'
}, {
  id: 7,
  name: 'Spy',
  cost: {
    grain: 0,
    apple: 0,
    honey: 200,
    meat: 0
  },
  upkeep: {
    grain: 2,
    apple: 0,
    honey: 0,
    meat: 0
  },
  stats: {
    attack: 15,
    defense: 40,
    capacity: 10
  },
  buildTime: 120000,
  travelTime: 150,
  description: 'A spy which can be used to spy on other villages without spies.',
  img: 'img/spy.png'
}]



////////////////////RESOURCES
const RESOURCE_TICK = 300000
const loopRes = ['grain', 'apple', 'honey', 'meat', 'villagers']
const srcRes = [
  'img/grain.png',
  'img/apple.png',
  'img/honey.png',
  'img/meat.png',
  'img/person.png',
]