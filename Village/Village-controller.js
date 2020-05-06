const chalk = require('chalk')
const Village = require('./Village-model')
const Building = require('../library/Building')
const Troop = require('../library/Troop')
const User = require('../User/User-model')

const RESOURCE_TICK = 300000
const STARVE_LIMIT = -10

exports.updateResources = () => {
  Village.find({})
    .then((villages) => {
      let promises = []
      for (let i = 0; i < villages.length; i++) {
        let v = villages[i]
        // this.calculateVillage(v)
        v = addProduction(v)
        // for (let i = 0; i < v.troops.length; i++) {
        //   v.troops[i].name = Troop.getTroop(i).name
        // }
        // v.troops.push({
        //   name: Troop.getTroop(3).name,
        //   troop: 3,
        //   units: 0,
        //   upkeep: {},
        //   away: 0
        // })
        // this.calculateVillage(v)
        promises.push(v.save())
      }
      return Promise.all(promises)
    })
    .then((res) => console.log(chalk.yellow('Updated resources: ' + res.length)))
}

exports.createVillage = (session) => {
  let village = new Village({
    owner: session.user,
    ownerName: session.username,
    position: { x: random(0, 6), y: random(0, 6) },
    name: 'Village of ' + session.username,
    resources: {
      grain: Math.floor(random(0, 1000)),
      apple: Math.floor(random(0, 1000)),
      honey: Math.floor(random(0, 1000)),
      meat: Math.floor(random(0, 100))
    }
  })

  for (let i = 0; i < 9; i++) {
    village.buildings.push({ building: 0, level: 0 })
  }
  village.buildings[4] = { building: 1, level: random(1, 10) }
  village.buildings[random(0, 3)] = { building: random(2, 8), level: random(1, 10) }
  village.buildings[random(5, 8)] = { building: random(2, 8), level: random(1, 10) }

  let villagers = Math.floor(random(50, 100))
  let troops = []
  for (let i = 0; i < 3; i++) {
    let t = Troop.getTroop(i)
    troops.push({ troop: i, name: t.name, units: villagers })
  }
  troops[1].units = 100 - villagers
  troops[2].units = random(0, 3)

  village.troops = troops

  this.calculateVillage(village)

  village.refreshed = Date.now()
  return village.save()
}

exports.upgradeBuilding = (req, res, next) => {
  console.log('Village upgrade ' + req.session.village)
  return Village.findById(req.session.village)
    .then((village) => {
      let building = village.buildings[req.query.slot]
      if (building.level > 0) {
        if (canAffordBuilding(village, building)) {
          village.buildings[req.query.slot] = buyBuilding(village, building)
          this.calculateVillage(village)
          let buildTime = Building.getBuilding(building.building).buildTime * (building.level + 1)
          return global.queue.queueBuilding(req.session.user, village, req.query.slot, building, buildTime)
            .then(() => village.save())
            .then(() => res.redirect('/game?village=' + req.session.villageIndex))
        }
      }
    })
    .catch((err) => {
      console.log(err)
      res.send({ error: 'error' })
    })
}

exports.buildBuilding = (req, res, next) => {
  console.log('Village build ' + req.session.village)
  return Village.findById(req.session.village)
    .then((village) => {
      let building = village.buildings[req.query.slot]
      if (building.building == 0 && building.level == 0) {
        building.building = req.query.type
        if (canAffordBuilding(village, building)) {
          village.buildings[req.query.slot] = buyBuilding(village, building)
          let buildTime = Building.getBuilding(building.building).buildTime * (building.level + 1)
          return global.queue.queueBuilding(req.session.user, village, req.query.slot, building, buildTime)
            .then(() => village.save())
            .then(() => res.redirect('/game?village=' + req.session.villageIndex))
        }
        else {
          res.redirect('/game?village=' + req.session.villageIndex)
        }
      }
      else {
        throw new Error('The slot is not empty!')
      }
    })
    .catch((err) => {
      console.log(err)
      res.send({ error: 'error' })
    })
}

exports.trainTroops = (req, res, next) => {
  console.log(`Village train ${req.session.village}.  ${req.query.from}->${req.query.troop}  ${req.query.amount}`)
  return Village.findById(req.session.village)
    .then((village) => {
      let troop = Troop.getTroop(req.query.troop)
      if (canAffordTroops(village, req.query.from, troop.id, req.query.amount)) {
        buyTroops(village, troop.id, req.query.amount)
        return global.queue.queueTroop(req.session.user, village, req.query.from, troop.id, req.query.amount, troop.buildTime)
          .then(() => village.save())
          .then(() => res.redirect('/game?village=' + req.session.villageIndex))
      }
      else
        res.redirect('/game?village=' + req.session.villageIndex)
    })
    .catch((err) => {
      console.log(err)
      res.send({ error: 'error' })
    })
}

const canAffordBuilding = (village, building) => {
  village = addProduction(village)
  let cost = getCostBuilding(building.building, building.level + 1)
  return (village.resources.grain >= cost.grain && village.resources.apple >= cost.apple && village.resources.honey >= cost.honey && village.resources.meat >= cost.meat)
}

const canAffordTroops = (village, from, troop, amount) => {
  village = addProduction(village)
  for (let i = 0; i < village.troops.length; i++) {
    if (village.troops[i].troop == from) {
      if (village.troops[i].units < amount)
        return false
    }
  }
  let cost = getCostTroop(troop, amount)
  return (village.resources.grain >= cost.grain && village.resources.apple >= cost.apple && village.resources.honey >= cost.honey && village.resources.meat >= cost.meat)
}

const buyBuilding = (village, building) => {
  village = addProduction(village)
  let cost = getCostBuilding(building.building, building.level + 1)
  village.resources.grain -= cost.grain
  village.resources.apple -= cost.apple
  village.resources.honey -= cost.honey
  village.resources.meat -= cost.meat
  building.constructing = true
  return building
}

const buyTroops = (village, troop, amount) => {
  village = addProduction(village)
  let cost = getCostTroop(troop, amount)
  village.resources.grain -= cost.grain
  village.resources.apple -= cost.apple
  village.resources.honey -= cost.honey
  village.resources.meat -= cost.meat
}

const addProduction = (vil) => {
  let diff = Date.now() - vil.refreshed
  let grain = vil.production.grain * diff / RESOURCE_TICK
  let apple = vil.production.apple * diff / RESOURCE_TICK
  let honey = vil.production.honey * diff / RESOURCE_TICK
  let meat = vil.production.meat * diff / RESOURCE_TICK
  vil.resources.grain = Math.min(vil.resources.grain + grain, vil.capacity.grain)
  vil.resources.apple = Math.min(vil.resources.apple + apple, vil.capacity.apple)
  vil.resources.honey = Math.min(vil.resources.honey + honey, vil.capacity.honey)
  vil.resources.meat = Math.min(vil.resources.meat + meat, vil.capacity.meat)

  if (vil.resources.grain <= STARVE_LIMIT) { starvation(vil, 'grain') }
  if (vil.resources.apple <= STARVE_LIMIT) { starvation(vil, 'apple') }
  if (vil.resources.honey <= STARVE_LIMIT) { starvation(vil, 'honey') }
  if (vil.resources.meat <= STARVE_LIMIT) { starvation(vil, 'meat') }

  let villagers = vil.production.villagers * diff / RESOURCE_TICK
  let oldVillagers = Math.floor(vil.resources.villagers)

  vil.resources.villagers = Math.min(vil.resources.villagers + villagers, vil.capacity.villagers)
  let fill = 1 - vil.resources.villagers / vil.capacity.villagers
  vil.production.villagers = Math.floor(vil.level * (0.05 + fill * fill * 0.45) * 10) / 10

  let newUnits = Math.floor(vil.resources.villagers) - oldVillagers
  if (diff > 0) {
    vil.troops[0].units += newUnits
    calculateUpkeep(vil)
  }

  vil.refreshed = Date.now()
  return vil
}

exports.calculateVillage = (village) => {
  let builds = village.buildings
  let exp = 0
  let prod = { grain: 0, apple: 0, honey: 0, meat: 0, villagers: village.production.villagers }
  let cap = { grain: 1000, apple: 1000, honey: 1000, meat: 500, villagers: 100 }
  for (let i = 0; i < builds.length; i++) {
    if (builds[i].building === 0)
      continue
    let lvl = builds[i].level
    let b = Building.getBuilding(builds[i].building)
    prod.grain += (b.production.grain * lvl)
    prod.apple += (b.production.apple * lvl)
    prod.honey += (b.production.honey * lvl)
    prod.meat += (b.production.meat * lvl)
    cap.grain += (b.capacity.grain * lvl)
    cap.apple += (b.capacity.apple * lvl)
    cap.honey += (b.capacity.honey * lvl)
    cap.meat += (b.capacity.meat * lvl)
    cap.villagers += (b.capacity.villagers * lvl)
    exp += (b.exp * lvl)
  }
  village.production = prod

  calculateUpkeep(village)

  village.capacity = cap
  village.level = exp
  village.troops = troops
}

const calculateUpkeep = (village) => {
  let troops = village.troops
  let count = 0
  for (let i = 0; i < troops.length; i++) {
    let t = Troop.getTroop(troops[i].troop)
    count += troops[i].units
    village.production.grain -= (t.upkeep.grain * troops[i].units)
    village.production.apple -= (t.upkeep.apple * troops[i].units)
    village.production.honey -= (t.upkeep.honey * troops[i].units)
    village.production.meat -= (t.upkeep.meat * troops[i].units)
    troops[i].upkeep.grain = (t.upkeep.grain * troops[i].units)
    troops[i].upkeep.apple = (t.upkeep.apple * troops[i].units)
    troops[i].upkeep.honey = (t.upkeep.honey * troops[i].units)
    troops[i].upkeep.meat = (t.upkeep.meat * troops[i].units)
  }
  village.resources.villagers = count
}

const getCostBuilding = (building, level) => {
  let b = Building.getBuilding(building)
  let grain = level * b.cost.grain
  let apple = level * b.cost.apple
  let honey = level * b.cost.honey
  let meat = level * b.cost.meat
  return { grain, apple, honey, meat }
}

const getCostTroop = (troop, amount) => {
  let t = Troop.getTroop(troop)
  let grain = t.cost.grain * amount
  let apple = t.cost.apple * amount
  let honey = t.cost.honey * amount
  let meat = t.cost.meat * amount
  return { grain, apple, honey, meat }
}

const starvation = (vil, type) => {
  let trps = vil.troops
  for (let i = 0; i < trps.length; i++) {
    let troop = Troop.getTroop(trps[i].troop)
    if (vil.resources[type] <= STARVE_LIMIT && troop.upkeep[type] > 0) {
      while (trps[i].units > 0 && vil.resources[type] <= STARVE_LIMIT) {
        trps[i].units--
        vil.resources[type] += troop.upkeep[type] * -STARVE_LIMIT
      }
    }
  }
  if (vil.resources[type] <= STARVE_LIMIT)
    vil.resources[type] = 0
  calculateVillage(vil)
  return vil
}

const random = (min, max) => {
  return Math.floor(min + Math.random() * (max - min + 1))
}