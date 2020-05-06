const Message = require('./Message-model')
const User = require('../User/User-model')
const Building = require('../library/Building')
const Troop = require('../library/Troop')

exports.sendMessage = (req, res, next) => {
  User.findOne({ username: req.body.recipient }).then((user) => {
    if (!user) {
      res.send({ status: 'User 404', error: 'Could not find that recipient.' })
      return
    }

    let message = {
      messageType: 'text',
      sender: req.session.username,
      recipient: user.id,
      topic: req.body.topic,
      message: req.body.message,
      createdAt: Date.now(),
    }

    return Message.create(message)
      .then((msg) => {
        user.unreadCount++
        return user.save()
      })
      .then(() => res.send({ status: 'OK' }))
      .catch(() => res.send({ status: '500', error: 'Unknown error' }))
  })
}

exports.getMessages = (req, res, next) => {
  return User.findOne({ _id: req.session.user })
    .then((user) => {
      if (user.unreadCount > 0) {
        user.unreadCount = 0
        return user.save()
      }
      else return Promise.resolve()
    })
    .then(() => Message.find({ recipient: req.session.user }))
    .then((messages) => {
      messages.sort((a, b) => b.createdAt - a.createdAt)
      res.render('inbox.pug', { layout: false, messages }, function(error, html) {
        res.send({ html, messages })
      })
    })
}

exports.removeMessage = (req, res, next) => {
  console.log('Remove message: ' + req.query.messageID)
  return Message.deleteOne({ _id: req.query.messageID, recipient: req.session.user }).then(() => res.send({ res: 'OK' }))
}

exports.createBuildingReport = (owner, building) => {
  console.log('Creating build report')
  let d = new Date()
  let b = Building.getBuilding(building.building)
  return User.findOne({ _id: owner })
    .then((user) => {
      user.unreadCount++
      return user.save()
    })
    .then(() =>
      Message.create({
        messageType: 'building',
        recipient: owner,
        sender: 'Worksers',
        topic: `${b.name} finished`,
        message: `Your ${b.name} of level ${building.level} was completed on ${d.toDateString()}`,
        createdAt: d.getTime(),
      })
    )
}

exports.createReinforcementReport = (sender, receiver, troops) => {
  console.log('Creating reinforcement report')
  let d = new Date()

  let troopStr = createTroopTable('Reinforcements', troops)

  let users = [
    User.findOne({ _id: sender.owner }).then((user) => {
      user.unreadCount++
      return user.save()
    }),
  ]

  let messages = [
    Message.create({
      messageType: 'reinforce',
      recipient: sender.owner,
      sender: 'Troopses',
      topic: `Your reinforcements arrived`,
      message: `Your troops from "${sender.name}" arrived in "${receiver.name}" on ${d.toDateString()}\n\n${troopStr}`,
      createdAt: d.getTime(),
    }),
  ]

  if (sender.owner !== receiver.owner) {
    users.push(
      User.findOne({ _id: receiver.owner }).then((user) => {
        user.unreadCount++
        return user.save()
      })
    )

    messages.push(
      Message.create({
        messageType: 'reinforce',
        recipient: receiver.owner,
        sender: sender.ownerName,
        topic: `Received reinforcements`,
        message: `Your received reinforcements in "${receiver.name}" from "${sender.name}" on ${d.toDateString()}\n\n${troopStr}`,
        createdAt: d.getTime(),
      })
    )
  }

  return Promise.all(users).then(() => Promise.all(messages))
}

exports.createSupplyReport = (sender, receiver, resources) => {
  console.log('Creating supply report')
  let d = new Date()

  let resStr = createResourceTable('Supplies', resources)

  let users = [
    User.findOne({ _id: sender.owner }).then((user) => {
      user.unreadCount++
      return user.save()
    }),
  ]

  let messages = [
    Message.create({
      messageType: 'reinforce',
      recipient: sender.owner,
      sender: 'Troopses',
      topic: `Your supplies arrived`,
      message: `Your resources from "${sender.name}" arrived in "${receiver.name}" on ${d.toDateString()}\n\n${resStr}`,
      createdAt: d.getTime(),
    }),
  ]

  if (sender.owner !== receiver.owner) {
    users.push(
      User.findOne({ _id: receiver.owner }).then((user) => {
        user.unreadCount++
        return user.save()
      })
    )

    messages.push(
      Message.create({
        messageType: 'reinforce',
        recipient: receiver.owner,
        sender: sender.ownerName,
        topic: `Received supplies`,
        message: `Your received supplies in "${receiver.name}" from "${sender.name}" on ${d.toDateString()}\n\n${resStr}`,
        createdAt: d.getTime(),
      })
    )
  }

  return Promise.all(users).then(() => Promise.all(messages))
}

exports.createAttackReport = (atkVillage, defVillage, survivors) => {
  console.log('Creating attack report')
  let d = new Date()
  let attackStr = createTroopTable(`Your troops (${atkVillage.name})`, survivors.attackers, survivors.steal)
  let defenseStr = createTroopTable(`Defenders (${defVillage.name})`, survivors.defenders)

  let users = [
    User.findOne({ _id: atkVillage.owner }).then((user) => {
      user.unreadCount++
      return user.save()
    }),
  ]

  let messages = [
    Message.create({
      messageType: survivors.survivors ? 'loot' : 'death',
      recipient: atkVillage.owner,
      sender: 'Attack Report',
      topic: `Attack on ${defVillage.name}`,
      message: `${attackStr}\n\n${defenseStr}`,
      createdAt: d.getTime(),
    }),
  ]

  attackStr = createTroopTable(`Attackers  (${atkVillage.name})`, survivors.attackers, survivors.steal)
  defenseStr = createTroopTable(`Your troops (${defVillage.name})`, survivors.defenders)

  users.push(
    User.findOne({ _id: defVillage.owner }).then((user) => {
      user.unreadCount++
      return user.save()
    })
  )

  messages.push(
    Message.create({
      messageType: survivors.survivors ? 'plunder' : 'defend',
      recipient: defVillage.owner,
      sender: atkVillage.ownerName,
      topic: survivors.survivors ? `Plunder in ${defVillage.name}` : `Defended ${defVillage.name}`,
      message: `${attackStr}\n\n${defenseStr}`,
      createdAt: d.getTime(),
    })
  )

  return Promise.all(users).then(() => Promise.all(messages))
}

const createTroopTable = (title, troops, resources) => {
  let rows = [`<tr><th class="table-border" colspan="${troops.length + 1}">${title}</th></tr>`]
  let icons = ['<tr><td class="table-border"></td>']
  let units = ['<tr><td class="table-border">Units</td>']
  let deaths = ['<tr><td class="table-border">Deaths</td>']
  for (let i = 0; i < troops.length; i++) {
    let t = Troop.getTroop(troops[i].troop)
    icons.push(`<td class="table-border"><img title=${t.name} src=${t.img} /></td>`)
    units.push(`<td class="table-border">${troops[i].units + troops[i].death}</td>`)
    deaths.push(`<td class="table-border">${troops[i].death}</td>`)
  }
  icons.push['</tr>']
  units.push['</tr>']
  deaths.push['</tr>']

  rows.push(icons.join(''))
  rows.push(units.join(''))
  rows.push(deaths.join(''))
  if (resources) {
    let capacity = Troop.getCapacity(troops)
    rows.push(
      `<tr class="table-border"><td><b>Loot: </b></td><td colspan="${troops.length}">
          <img style="inline" title="Grain" src="img/grain.png" />: ${resources.grain}, 
          <img style="inline" title="Apple" src="img/apple.png" />: ${resources.apple}, 
          <img style="inline" title="Honey" src="img/honey.png" />: ${resources.honey}, 
          <img style="inline" title="Meat" src="img/meat.png"/>: ${resources.meat}, 
          Tot:[${ resources.grain + resources.apple + resources.honey + resources.meat}/${capacity}]
        </td></tr>`
    )
  }
  return `<table class="troop-table">${rows.join('')}</table>`
}

const createResourceTable = (title, resources) => {
  let rows = [`<tr><th class="table-border">${title}</th></tr>`]
  rows.push(`<tr class="table-border"><td><b>Resources: </b></td><td>
        <img style="inline" title="Grain" src="img/grain.png" />: ${resources.grain}, 
        <img style="inline" title="Apple" src="img/apple.png" />: ${resources.apple}, 
        <img style="inline" title="Honey" src="img/honey.png" />: ${resources.honey}, 
        <img style="inline" title="Meat" src="img/meat.png"/>: ${resources.meat}
    </td></tr>`)
  return `<table class="troop-table">${rows.join('')}</table>`
}