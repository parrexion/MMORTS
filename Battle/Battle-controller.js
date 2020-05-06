const messageController = require('../Message/Message-controller')
const villageController = require('../Village/Village-controller')
const Village = require('../Village/Village-model')
const Troop = require('../library/Troop')

exports.sendTroops = (req, res, next) => {
  let body = req.body
  console.log('Target ID: ' + body.id)
  console.log('SendType: ' + JSON.stringify(body.sendType))
  console.log('Troops: ' + JSON.stringify(body.troops))
  console.log('Resources: ' + JSON.stringify(body.resources))

  promises = [
    Village.findOne({ _id: req.session.village }),
    Village.findOne({ _id: body.id })
  ]

  return Promise.all(promises)
    .then((villages) => {
      if (body.sendType === 'attack') {
        return attack(villages, body.troops)
      }
      else if (body.sendType === 'reinforce') {
        return reinforce(villages, body.troops)
      }
      else if (body.sendType === 'resources') {
        return supply(villages, body.troops, body.resources)
      }
    })
    .then(() => res.send({ res: 'OK' }))
}

exports.calculateAttack = (village, troops) => {
  let survivors = calculateBattle(troops, village.troops)

  let resources = village.resources.grain + village.resources.apple + village.resources.honey + village.resources.meat
  let capacity = Troop.getCapacity(survivors.attackers)
  let raidPercent = Math.min(1, capacity / resources)
  console.log(`res:${JSON.stringify(resources)}  cap:${capacity}  %:${raidPercent}`)
  let steal = {
    grain: Math.round(village.resources.grain * raidPercent),
    apple: Math.round(village.resources.apple * raidPercent),
    honey: Math.round(village.resources.honey * raidPercent),
    meat: Math.round(village.resources.meat * raidPercent)
  }
  survivors.steal = steal

  return survivors
}

const calculateBattle = (attackers, defenders) => {
  let atkPower = Troop.getStrength(attackers).attack
  let defPower = Troop.getStrength(defenders).defense
  let atkLoss = 1
  let defLoss = 1
  if (atkPower > defPower) {
    let ratio = defPower / atkPower
    atkLoss = Math.sqrt(ratio) * ratio
    console.log(`Win Ratio: ${ratio} ${atkPower} ${defPower}`)
  }
  else {
    let ratio = atkPower / defPower
    defLoss = Math.sqrt(ratio) * ratio
    console.log(`Win Ratio: ${ratio} ${atkPower} ${defPower}`)
  }

  let survivors = { attackers: [], defenders: [], survivors: (atkPower > defPower) }
  for (let i = 0; i < attackers.length; i++) {
    let death = Math.round(attackers[i].units * atkLoss)
    survivors.attackers.push({
      troop: attackers[i].troop,
      units: attackers[i].units - death,
      death: death
    })
  }
  for (let i = 0; i < defenders.length; i++) {
    let death = Math.round(defenders[i].units * defLoss)
    survivors.defenders.push({
      troop: defenders[i].troop,
      units: defenders[i].units - death,
      death: death
    })
  }

  return survivors
}

const attack = (villages, troops) => {
  for (let i = 0; i < troops.length; i++) {
    villages[0].troops[troops[i].troop].units -= troops[i].units
  }

  villageController.calculateVillage(villages[0])
  global.queue.queueAttack(villages[0], villages[1], troops)

  return villages[0].save()
}

const reinforce = (villages, troops) => {
  for (let i = 0; i < troops.length; i++) {
    villages[0].troops[troops[i].troop].units -= troops[i].units
  }

  villageController.calculateVillage(villages[0])
  global.queue.queueReinforcement(villages[0], villages[1], troops)

  return villages[0].save()
}

const supply = (villages, troops, resources) => {
  for (let i = 0; i < troops.length; i++) {
    villages[0].troops[troops[i].troop].units -= troops[i].units
  }

  villages[0].resources.grain -= resources.grain
  villages[0].resources.apple -= resources.apple
  villages[0].resources.honey -= resources.honey
  villages[0].resources.meat -= resources.meat

  villageController.calculateVillage(villages[0])
  global.queue.queueSupply(villages[0], villages[1], troops, resources)

  return villages[0].save()
}