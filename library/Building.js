exports.getBuilding = (id) => {
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