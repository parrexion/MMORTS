const Movement = require('./Movement-model')
const Order = require('./Order-model')
const Village = require('../Village/Village-model')
const Troop = require('../library/Troop')
const villageController = require('../Village/Village-controller')
const messageController = require('../Message/Message-controller')
const battleController = require('../Battle/Battle-controller')

class EventQueue {
  timeout = 1000
  orderList = []
  movementList = []

  start = (interval) => {
    this.timeout = interval
    return Order.find({})
      .then((orders) => {
        this.orderList = orders
        this.orderList.sort((a, b) => a.finishTime - b.finishTime)
      })
      .then(() => {
        return Movement.find({})
          .then((movements) => {
            this.movementList = movements
            this.movementList.sort((a, b) => a.finishTime - b.finishTime)
            this.poll()
          })
      })
  }

  getVillageOrders = (villageID) => {
    if (this.orderList.length == 0)
      return []
    return this.orderList.filter(order => order.village == villageID)
  }

  getVillageMovements = (villageID) => {
    if (this.movementList.length == 0)
      return []
    return this.movementList.filter(movement => movement.owner == villageID)
  }

  poll = () => {
    let promises = []
    while (this.orderList.length > 0 && this.orderList[0].finishTime < Date.now()) {
      console.log('Order completed')
      let order = this.orderList.shift()
      let p = Promise.resolve(order)
      if (order.orderType == 'building')
        p = this.build(order)
      else if (order.orderType == 'troop')
        p = this.train(order)

      let promise = Promise.resolve(p)
        .then((order) => {
          if (order.orderType == 'building' || (order.orderType == 'troop' && order.troop.amount <= 0)) {
            return Order.deleteOne({ _id: order.id })
          }
          else {
            console.log('Added back order for troop   x' + order.troop.amount)
            return this.queueOrder(order)
          }
        })
      promises.push(promise)
    }

    while (this.movementList.length > 0 && this.movementList[0].finishTime < Date.now()) {
      console.log('Movement completed')
      let movement = this.movementList.shift()
      let p = Promise.resolve(movement)
      if (movement.movementType == 'reinforce-to' || movement.movementType == 'attack-return') {
        p = this.reinforce(movement)
      }
      else if (movement.movementType == 'attack-to') {
        p = this.attack(movement)
      }
      else if (movement.movementType == 'supply-to') {
        p = this.supply(movement)
      }

      let promise = Promise.resolve(p)
        .then((movement) => {
          return Movement.deleteOne({ _id: movement.id })
        })
      promises.push(promise)
    }

    Promise.all(promises)
      .then(() => setTimeout(() => { this.poll() }, this.timeout))
  }




  ////////////////////////////////////////////////////////////




  queueOrder = (order) => order.save()
    .then((order) => {
      this.orderList.push(order)
      this.orderList.sort((a, b) => a.finishTime - b.finishTime)
      return order
    })

  queueMovement = (movement) => movement.save()
    .then((movement) => {
      this.movementList.push(movement)
      this.movementList.sort((a, b) => a.finishTime - b.finishTime)
      return movement
    })

  queueBuilding = (owner, village, slot, building, buildTime) => {
    let order = new Order({
      owner,
      village: village.id,
      orderType: 'building',
      building: {
        slot,
        building: building.building,
        level: building.level + 1
      },
      finishTime: Date.now() + buildTime
    })
    for (let i = this.orderList.length - 1; i >= 0; i--) {
      if (this.orderList[i].village == village.id && this.orderList[i].orderType == 'building') {
        order.finishTime = this.orderList[i].finishTime + buildTime
        break
      }
    }
    console.log('Added order for building  ' + buildTime)
    return this.queueOrder(order)
  }

  queueTroop = (owner, village, from, troop, amount, buildTime) => {
    let order = new Order({
      owner,
      village: village.id,
      orderType: 'troop',
      troop: { from, troop, amount },
      finishTime: Date.now() + buildTime
    })
    for (let i = this.orderList.length - 1; i >= 0; i--) {
      if (this.orderList[i].village == village.id && this.orderList[i].orderType == 'troop') {
        let t = Troop.getTroop(this.orderList[i].troop.troop)
        let otherAmount = this.orderList[i].troop.amount - 1
        order.finishTime = this.orderList[i].finishTime + otherAmount * t.buildTime + buildTime
        break
      }
    }
    console.log('Added order for troop  ' + buildTime)
    return this.queueOrder(order)
  }

  queueReinforcement = (start, end, troops) => {
    let travelTime = Date.now() + Troop.getTravelTime(troops, start.position, end.position)
    let movementFrom = new Movement({
      owner: start.id,
      movementType: 'reinforce-from',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      finishTime: travelTime
    })
    let movementTo = new Movement({
      owner: end.id,
      movementType: 'reinforce-to',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      finishTime: travelTime
    })
    let queues = [
      this.queueMovement(movementFrom),
      this.queueMovement(movementTo)
    ]
    return Promise.all(queues)
  }

  queueAttack = (start, end, troops) => {
    let travelTime = Date.now() + Troop.getTravelTime(troops, start.position, end.position)
    let movementFrom = new Movement({
      owner: start.id,
      movementType: 'attack-from',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      finishTime: travelTime
    })
    let movementTo = new Movement({
      owner: end.id,
      movementType: 'attack-to',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      finishTime: travelTime
    })
    let queues = [
      this.queueMovement(movementFrom),
      this.queueMovement(movementTo)
    ]
    return Promise.all(queues)
  }

  queueSupply = (start, end, troops, resources) => {
    let travelTime = Date.now() + Troop.getTravelTime(troops, start.position, end.position)
    let movementFrom = new Movement({
      owner: start.id,
      movementType: 'supply-from',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      resources,
      finishTime: travelTime
    })
    let movementTo = new Movement({
      owner: end.id,
      movementType: 'supply-to',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops,
      resources,
      finishTime: travelTime
    })
    let queues = [
      this.queueMovement(movementFrom),
      this.queueMovement(movementTo)
    ]
    return Promise.all(queues)
  }

  queueReturn = (start, end, survivors) => {
    if (!survivors.survivors) {
      return Promise.resolve()
    }
    let travelTime = Date.now() + Troop.getTravelTime(survivors.attackers, start.position, end.position)
    let movement = new Movement({
      owner: end.id,
      movementType: 'attack-return',
      startVillage: { id: start.id, name: start.name },
      endVillage: { id: end.id, name: end.name },
      troops: survivors.attackers,
      resources: survivors.steal,
      finishTime: travelTime
    })

    return this.queueMovement(movement)
  }





  ////////////////////////////////////////////////////////////





  build = (order) => {
    return Village.findById(order.village)
      .then((village) => {
        messageController.createBuildingReport(order.owner, order.building)
        village.buildings[order.building.slot].level = order.building.level
        village.buildings[order.building.slot].constructing = false
        villageController.calculateVillage(village)
        return village.save()
      })
      .then(() => order)
  }

  train = (order) => {
    return Village.findById(order.village)
      .then((village) => {
        for (let i = 0; i < village.troops.length; i++) {
          if (village.troops[i].troop == order.troop.from) {
            village.troops[i].units--
          }
          if (village.troops[i].troop == order.troop.troop) {
            village.troops[i].units++
          }
        }
        villageController.calculateVillage(village)
        order.troop.amount--
        if (order.troop.amount > 0) {
          let t = Troop.getTroop(order.troop.troop)
          order.finishTime += t.buildTime
        }
        return village.save()
          .then(() => order)
      })
  }

  reinforce = (movement) => {
    return Village.findById(movement.endVillage.id)
      .then((village) => {
        for (let i = 0; i < movement.troops.length; i++) {
          village.troops[movement.troops[i].troop].units += movement.troops[i].units
        }
        if (movement.resources.grain > 0 || movement.resources.apple > 0 || movement.resources.honey > 0 || movement.resources.meat > 0) {
          village.resources.grain = Math.min(village.resources.grain + movement.resources.grain, village.capacity.grain)
          village.resources.apple = Math.min(village.resources.apple + movement.resources.apple, village.capacity.apple)
          village.resources.honey = Math.min(village.resources.honey + movement.resources.honey, village.capacity.honey)
          village.resources.meat = Math.min(village.resources.meat + movement.resources.meat, village.capacity.meat)
        }
        villageController.calculateVillage(village)
        if (movement.movementType === 'reinforce') {
          Village.findById(movement.startVillage.id)
            .then((startVillage) => messageController.createReinforcementReport(startVillage, village, movement.troops))
        }
        return village.save()
      })
      .then(() => movement)
  }

  attack = (movement) => {
    return Village.findById(movement.endVillage.id)
      .then((village) => {
        let survivors = battleController.calculateAttack(village, movement.troops)
        village.resources.grain -= survivors.steal.grain
        village.resources.apple -= survivors.steal.apple
        village.resources.honey -= survivors.steal.honey
        village.resources.meat -= survivors.steal.meat
        for (let i = 0; i < survivors.defenders.length; i++) {
          village.troops[i].units = survivors.defenders[i].units
        }
        villageController.calculateVillage(village)

        let promises = []
        promises.push(village.save())

        promises.push(Village.findById(movement.startVillage.id)
          .then((originVillage) => {
            messageController.createAttackReport(originVillage, village, survivors)
            return this.queueReturn(village, originVillage, survivors)
          })
        )

        return Promise.all(promises)
      })
      .then(() => movement)
  }

  supply = (movement) => {
    return Village.findById(movement.endVillage.id)
      .then((village) => {
        village.resources.grain = Math.min(village.resources.grain + movement.resources.grain, village.capacity.grain)
        village.resources.apple = Math.min(village.resources.apple + movement.resources.apple, village.capacity.apple)
        village.resources.honey = Math.min(village.resources.honey + movement.resources.honey, village.capacity.honey)
        village.resources.meat = Math.min(village.resources.meat + movement.resources.meat, village.capacity.meat)
        villageController.calculateVillage(village)

        let promises = []
        promises.push(village.save())

        promises.push(Village.findById(movement.startVillage.id)
          .then((originVillage) => {
            messageController.createSupplyReport(originVillage, village, movement.resources)
            let survivors = { survivors: true, attackers: movement.troops, resources: { grain: 0, apple: 0, honey: 0, meat: 0 } }
            return this.queueReturn(village, originVillage, survivors)
          })
        )

        return Promise.all(promises)
      })
      .then(() => movement)
  }
}

module.exports = EventQueue