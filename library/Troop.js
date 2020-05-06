exports.getTroop = (id) => {
  for (let i = 0; i < troops.length; i++) {
    if (troops[i].id == id)
      return troops[i]
  }
}

exports.getTravelTime = (troops, start, end) => {
  let slowest = 1000
  for (let i = 0; i < troops.length; i++) {
    if (troops[i].units > 0) {
      let t = this.getTroop(troops[i].troop)
      if (t.travelTime < slowest)
        slowest = t.travelTime
    }
  }

  let distance = this.getDistance(start, end)
  return distance / slowest * 3600 * 1000
}

exports.getDistance = (start, end) => {
  return Math.abs(start.x - end.x) + Math.abs(start.y - end.y)
}

exports.getStrength = (troops) => {
  let attack = 0
  let defense = 0
  for (let i = 0; i < troops.length; i++) {
    if (troops[i].units > 0) {
      let t = this.getTroop(troops[i].troop)
      attack += t.stats.attack * troops[i].units
      defense += t.stats.defense * troops[i].units
    }
  }
  return { attack, defense }
}

exports.getCapacity = (troops) => {
  let capacity = 0
  console.log('  Units: ' + JSON.stringify(troops))
  for (let i = 0; i < troops.length; i++) {
    if (troops[i].units - troops[i].death > 0) {
      let t = this.getTroop(troops[i].troop)
      capacity += t.stats.capacity * (troops[i].units)
    }
  }
  return capacity
}

exports.count = () => {
  return troops.length
}

const troops = [{
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