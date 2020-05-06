//////////////////////INFO and MENUS

const selectTab = (tab) => {
  if (tab != 3 && document.getElementById('inbox-div').style.display === 'block')
    document.getElementById('tab-message').innerHTML = 'Messages (0)'

  switch (tab) {
    case 0:
      closeInfo()
      break
    case 1:
      closeInfo()
      showTroops()
      break
    case 2:
      retrieveMap()
      break
    case 3:
      showMessages()
      break
  }
}

const closeInfo = () => {
  document.getElementById('info-box').style.display = 'none'
  document.getElementById('build-menu').style.display = 'none'
  document.getElementById('troop-menu').style.display = 'none'
  document.getElementById('map-div').style.display = 'none'
  document.getElementById('map-info').style.display = 'none'
  document.getElementById('inbox-div').style.display = 'none'
}



////////////////////////BUILDINGS

const showBuilding = (slot, building, level, constructing) => {
  document.getElementById('troop-menu').style.display = 'none'
  let buildMenu = document.getElementById('build-menu')
  let info = document.getElementById('info-box')
  let infoTitle = document.getElementById('info-title')
  let infoLevel = document.getElementById('info-level')
  let infoImage = document.getElementById('info-image')
  let infoDescription = document.getElementById('info-description')
  let upgradeButton = document.getElementById('info-upgrade')
  let infoCost = document.getElementById('info-cost')

  if (building == 0) {
    buildMenu.style.display = 'block'
    info.style.display = 'none'
    infoTitle.textContent = 'Build menu'
    infoLevel.textContent = ''
    infoImage.style.display = 'none'
    infoDescription.textContent = ''
    upgradeButton.style.display = 'none'
    infoCost.innerHTML = ''
    let buttons = document.getElementsByClassName('build-button')
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].onclick = () => buildBuilding(slot, i + 2)
    }
  }
  else {
    buildMenu.style.display = 'none'
    info.style.display = 'block'
    infoImage.style.display = 'block'
    infoLevel.textContent = 'Level: ' + level
    upgradeButton.style.display = (level < 20 && !constructing) ? 'block' : 'none'
    upgradeButton.onclick = () => upgradeBuilding(slot)
    if (constructing) {
      infoCost.innerHTML = `<h3>Under<br>construction</h3><p>Currently building level ${level+1}</p>`
    }
    else if (level < 20) {
      let cost = getBuildingCost(building, level + 1)
      infoCost.innerHTML = `<h3>Cost</h3><p>For level: ${cost.level}</p><p>Grain: ${cost.grain}<br>Apple: ${cost.apple}<br>Honey: ${cost.honey}<br>Meat: ${cost.meat}<br>Time: ${timeFromDate(cost.time)}</p>`
    }
    else {
      infoCost.innerHTML = ''
    }

    let b = getBuilding(building)
    infoTitle.textContent = b.name
    infoImage.src = b.img
    infoDescription.textContent = b.desc
  }
}





///////////////////////////TROOPS

const showTroops = () => {
  document.getElementById('troop-menu').style.display = 'block'
}

const troopTypeChanged = (obj, slot) => {
  let troopType1 = document.getElementById('troop-slot1').value
  let troop1 = getTroop(troopType1)
  document.getElementById('troop-info1').innerHTML = troop1.description
  document.getElementById('troop-img1').src = troop1.img

  let troopType2 = document.getElementById('troop-slot2').value
  let troop2 = getTroop(troopType2)
  document.getElementById('troop-info2').innerHTML = troop2.description
  document.getElementById('troop-img2').src = troop2.img
  document.getElementById('troop-cost2').innerHTML = `<p><strong>Cost to convert</strong><br>Grain: ${troop2.cost.grain}<br>Meat: ${troop2.cost.meat}</p>`

  if (troopType1 === troopType2)
    troopType2 = -1

  troopCountChanged(document.getElementById('convert-from'), troopType2)
}

const troopCountChanged = (obj, type) => {
  if (typeof type === 'undefined')
    type = document.getElementById('troop-slot2').value

  let count = parseInt(obj.value.replace(/[^0-9]/g, '').substring(0, 5))
  if (isNaN(count)) {
    obj.value = ''
    count = 1
  }
  else {
    obj.value = count
  }
  let t = (type == -1) ? null : getTroop(type)
  if (!t)
    document.getElementById('troop-cost').innerHTML = `<p><strong>Cost to convert</strong><br><br></p>`
  else
    document.getElementById('troop-cost').innerHTML = `<p><strong>Cost to convert</strong><br>Grain: ${t.cost.grain * count}<br>Apple: ${t.cost.apple * count}<br>Honey: ${t.cost.honey * count}<br>Meat: ${t.cost.meat * count}</p>`
}

const startTraining = () => {
  let from = document.getElementById('troop-slot1').value
  let type = document.getElementById('troop-slot2').value
  let amount = document.getElementById('convert-from').value
  trainTroops(from, type, amount)
}








//////////////////////MAP

const showMap = () => {
  document.getElementById('map-div').style.display = 'block'
}

const showMapInfo = (id, name, owner, level, state) => {
  let infoStr = `<h3>${name}</h3><p>Owner: ${owner}</p><p>Level: ${level}</p>`
  document.getElementById('village-info').innerHTML = infoStr

  let troopButton = document.getElementById('map-action-troops')
  let resourceButton = document.getElementById('map-action-send')
  troopButton.style.display = (state == 2) ? 'none' : 'block'
  resourceButton.style.display = (state == 2) ? 'none' : 'block'

  if (state == 0) {
    troopButton.innerHTML = 'Attack'
    troopButton.onclick = () => showAttackTroops(id)
    resourceButton.onclick = () => showSendResources(id, state)
    document.getElementById('map-image').src = 'img/enemyTown.png'
  }
  else if (state == 1) {
    troopButton.innerHTML = 'Reinforce'
    troopButton.onclick = () => showMoveTroops(id)
    resourceButton.onclick = () => showSendResources(id, state)
    document.getElementById('map-image').src = 'img/allyTown.png'
  }
  else {
    document.getElementById('map-image').src = 'img/currentTown.png'
  }

  document.getElementById('map-info').style.display = 'block'
}

const closeMapInfo = () => {
  document.getElementById('map-info').style.display = 'none'
  document.getElementById('send-troops').style.display = 'none'
  document.getElementById('send-resources').style.display = 'none'
}

const showAttackTroops = (id) => {
  document.getElementById('send-troops').style.display = 'block'
  document.getElementById('send-resources').style.display = 'none'
  document.getElementById('send-troops-title').innerHTML = 'Attack village'
  document.getElementById('map-action-troops').onclick = () => sendTroops(id, 'attack')
  document.getElementById('map-action-send').onclick = () => showSendResources(id, 0)
}

const showMoveTroops = (id) => {
  document.getElementById('send-troops').style.display = 'block'
  document.getElementById('send-resources').style.display = 'none'
  document.getElementById('send-troops-title').innerHTML = 'Reinforce village'
  document.getElementById('map-action-troops').onclick = () => sendTroops(id, 'reinforce')
  document.getElementById('map-action-send').onclick = () => showSendResources(id, 1)
}

const showSendResources = (id, state) => {
  document.getElementById('send-resources').style.display = 'block'
  document.getElementById('send-troops').style.display = 'block'
  document.getElementById('send-troops-title').innerHTML = 'Send Resources'
  document.getElementById('map-action-send').onclick = () => sendTroops(id, 'resources')
  if (state == 0)
    document.getElementById('map-action-troops').onclick = () => showAttackTroops(id)
  else if (state == 1)
    document.getElementById('map-action-troops').onclick = () => showMoveTroops(id)
}

const calculateCapacity = (obj) => {
  let objValue = parseInt(obj.value)
  while (objValue > obj.max && obj.value.length > 0) {
    obj.value = obj.value.substring(0, obj.value.length - 1)
    objValue = parseInt(obj.value)
  }

  let capacity = 0
  let inputs = document.getElementById("troop-inputs").getElementsByTagName('input')
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value.length == 0)
      inputs[i].value = '0'
    capacity += getTroop(i).stats.capacity * parseInt(inputs[i].value)
  }

  let res = 0
  inputs = document.getElementById("resource-inputs").getElementsByTagName('input')
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value.length == 0)
      inputs[i].value = '0'
    res += parseInt(inputs[i].value)
  }

  document.getElementById("send-capacity").innerHTML = `${res} / ${capacity}`
}










////////////////////////MESSAGES

const showMessages = () => {
  retrieveMessages()
  resetMessage()
}

const showInbox = () => {
  document.getElementById('inbox-page').style.display = 'block'
  document.getElementById('outbox-page').style.display = 'none'
}

const showOutbox = () => {
  document.getElementById('inbox-page').style.display = 'none'
  document.getElementById('outbox-page').style.display = 'block'

  document.getElementById('outbox-error').innerHTML = ''
  document.getElementById('outbox-success').innerHTML = ''
}

const resetMessage = () => {
  document.getElementById('outbox-recipient').value = ''
  document.getElementById('outbox-topic').value = ''
  document.getElementById('outbox-message').value = ''

  document.getElementById('outbox-error').innerHTML = ''
  document.getElementById('outbox-success').innerHTML = ''
}

const selectMessage = (index) => {
  let mesStr = sessionStorage.getItem('messages')
  if (mesStr) {
    let messages = JSON.parse(mesStr)
    document.getElementById('message-sender').innerHTML = 'From: ' + messages[index].sender
    document.getElementById('message-topic').innerHTML = messages[index].topic
    document.getElementById('message-message').innerHTML = messages[index].message

    let entries = document.getElementsByClassName('message-entry')
    for (let i = 0; i < entries.length; i++) {
      entries[i].style.backgroundColor = (i == index) ? '#dfd' : '#fff'
    }
  }
}

const removeMessage = (index, type) => {
  console.log(index)
  let mesStr = sessionStorage.getItem('messages')
  if (mesStr) {
    let res = true
    if (type === 'text')
      res = confirm('Are you sure you want to delete the message?')
    if (res) {
      let table = document.getElementById('message-table')
      table.deleteRow(index)

      let messages = JSON.parse(mesStr)
      sendRemoveMessage(messages[index]._id)
      messages.splice(index, 1)
      sessionStorage.setItem('messages', JSON.stringify(messages))

      for (let i = index; i < messages.length; i++) {
        let tr = table.children[0].children[i]
        tr.children[0].children[1].children[0].href = `javascript:selectMessage(${i})`
        tr.children[2].children[0].href = `javascript:removeMessage(${i},"${messages[i].messageType}")`
      }
    }
  }
}

const createTroopTable = (troops, type) => {
  let rows = []
  let entries = []
  for (let i = 0; i < troopLibrary.length; i++) {
    let t = getTroop(i)
    entries.push(`<td><img title=${t.name} src=${t.img} /></td>`)
  }
  rows.push(entries.join(''))
  return `<table style="display:inline-table">${rows.join("")}</table>`
}








////////////////////////RETRIEVING

const selectVillage = (index) => {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    let resObj = JSON.parse(this.responseText)
    document.getElementById('village-wrapper').innerHTML = resObj.html
    document.getElementById('tab-wrapper').innerHTML = resObj.tabs
    updateResources(resObj.data)
    updateBuildTime(resObj.orders, resObj.movements)
  }
  xhttp.open('GET', '/game?village=' + index, true)
  xhttp.send()
}

const buildBuilding = (slot, type) => {
  closeInfo()
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    let resObj = JSON.parse(this.responseText)
    if (resObj.error)
      return
    document.getElementById('village-wrapper').innerHTML = resObj.html
    updateResources(resObj.data)
    updateBuildTime(resObj.orders, resObj.movements)
  }
  xhttp.open('GET', `/build?slot=${slot}&type=${type}`, true)
  xhttp.send()
}

const upgradeBuilding = (slot) => {
  document.getElementById('info-upgrade').style.display = 'none'
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    let resObj = JSON.parse(this.responseText)
    if (resObj.error)
      return
    document.getElementById('village-wrapper').innerHTML = resObj.html
    updateResources(resObj.data)
    updateBuildTime(resObj.orders, resObj.movements)
  }
  xhttp.open('GET', `/upgrade?slot=${slot}`, true)
  xhttp.send()
}

const trainTroops = (from, type, amount) => {
  closeInfo()
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    let resObj = JSON.parse(this.responseText)
    if (resObj.error)
      return
    document.getElementById('village-wrapper').innerHTML = resObj.html
    updateResources(resObj.data)
    updateBuildTime(resObj.orders, resObj.movements)
  }
  xhttp.open('GET', `/train?from=${from}&troop=${type}&amount=${amount}`, true)
  xhttp.send()
}

const retrieveMap = () => {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    closeInfo()
    // let resObj = JSON.parse(this.responseText)
    // document.getElementById('map-menu').innerHTML = resObj.html
    document.getElementById('map-div').innerHTML = this.responseText
    document.getElementById('map-div').style.display = 'block'
  }
  xhttp.open('GET', '/map', true)
  xhttp.send()
}

const retrieveMessages = () => {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    closeInfo()
    let resObj = JSON.parse(this.responseText)
    document.getElementById('inbox-div').innerHTML = resObj.html
    document.getElementById('inbox-div').style.display = 'block'
    sessionStorage.setItem('messages', JSON.stringify(resObj.messages))
    if (resObj.messages.length > 0)
      selectMessage(0)
  }
  xhttp.open('GET', '/inbox', true)
  xhttp.send()
}

const sendMessage = () => {
  let data = {}
  data.recipient = document.getElementById('outbox-recipient').value
  data.topic = document.getElementById('outbox-topic').value
  data.message = document.getElementById('outbox-message').value

  document.getElementById('outbox-send').style.visibility = 'hidden'

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    // console.log('res:  ' + this.responseText)
    let resObj = JSON.parse(this.responseText)
    document.getElementById('outbox-send').style.visibility = 'visible'

    if (resObj.error) {
      document.getElementById('outbox-error').innerHTML = resObj.error
      document.getElementById('outbox-success').innerHTML = ''
    }
    else {
      resetMessage()
      document.getElementById('outbox-error').innerHTML = ''
      document.getElementById('outbox-success').innerHTML = 'Successfully sent the message'
    }
  }
  xhttp.open('POST', '/pm', true)
  xhttp.setRequestHeader("Content-type", "application/json")
  xhttp.send(JSON.stringify(data))
}

const sendRemoveMessage = (messageID) => {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return
    console.log('res:  ' + this.responseText)
  }
  xhttp.open('DELETE', `/pm-delete?messageID=${messageID}`, true)
  xhttp.send()
}

const sendTroops = (id, sendType) => {
  let data = { id, sendType, troops: [], resources: [] }
  let inputs = document.getElementById("troop-inputs").getElementsByTagName('input')
  let ok = false
  for (let i = 0; i < inputs.length; i++) {
    data.troops.push({
      troop: i,
      units: parseInt(inputs[i].value)
    })
    if (data.troops[i].units > 0)
      ok = true
  }

  if (!ok)
    return

  if (sendType === 'resources') {
    inputs = document.getElementById("resource-inputs").getElementsByTagName('input')

    data.resources = {
      grain: parseInt(inputs[0].value),
      apple: parseInt(inputs[1].value),
      honey: parseInt(inputs[2].value),
      meat: parseInt(inputs[3].value)
    }

    if (data.resources.grain == 0 && data.resources.apple == 0 && data.resources.honey == 0 && data.resources.meat == 0)
      return
  }

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState != 4)
      return

    console.log('res:  ' + this.responseText)
    location.reload()
  }
  xhttp.open('POST', '/send', true)
  xhttp.setRequestHeader("Content-type", "application/json")
  xhttp.send(JSON.stringify(data))
}








/////////////Fake it till you make it

const updateResources = (village) => {
  let resourceData = {
    grain: document.getElementById('grainTotal'),
    apple: document.getElementById('appleTotal'),
    honey: document.getElementById('honeyTotal'),
    meat: document.getElementById('meatTotal'),
    village
  }

  if (village && resourceData.grain && resourceData.apple && resourceData.honey && resourceData.meat)
    setTimeout(fakeUpdateInterval, 3000, resourceData, village.refreshed)
}

const fakeUpdateInterval = (data, startTime) => {
  let diff = Date.now() - startTime
  let grain = Math.min(data.village.capacity.grain, data.village.resources.grain + Math.floor((data.village.production.grain) * (diff / RESOURCE_TICK)))
  data.grain.innerHTML = `${grain} / ${data.village.capacity.grain}`
  let apple = Math.min(data.village.capacity.apple, data.village.resources.apple + Math.floor((data.village.production.apple) * (diff / RESOURCE_TICK)))
  data.apple.innerHTML = `${apple} / ${data.village.capacity.apple}`
  let honey = Math.min(data.village.capacity.honey, data.village.resources.honey + Math.floor((data.village.production.honey) * (diff / RESOURCE_TICK)))
  data.honey.innerHTML = `${honey} / ${data.village.capacity.honey}`
  let meat = Math.min(data.village.capacity.meat, data.village.resources.meat + Math.floor((data.village.production.meat) * (diff / RESOURCE_TICK)))
  data.meat.innerHTML = `${meat} / ${data.village.capacity.meat}`

  setTimeout(() => fakeUpdateInterval(data, startTime), 3000)
}

const updateBuildTime = (orders, movements) => {
  // console.log(orders)
  // console.log(movements)
  document.getElementById('work-queue').style.display = (orders.length > 0) ? 'block' : 'none'
  document.getElementById('movement-queue').style.display = (movements.length > 0) ? 'block' : 'none'

  let buildTable = document.getElementById('build-order-table')
  let troopTable = document.getElementById('troop-movement-table')

  let content = []
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].orderType == 'building') {
      let b = getBuilding(orders[i].building.building)
      let time = orders[i].finishTime - Date.now()
      if (time < -3000 && !done) {
        location.reload()
        done = true
      }
      content.push(`<tr><td><img class="icon" title="building" src="img/house.png" /><span>${b.name} Lv.${orders[i].building.level}</span></td><td class="buildTime">${timeFromDate(time)}</td></tr>`)
    }
  }
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].orderType == 'troop') {
      let t = getTroop(orders[i].troop.troop)
      let time = orders[i].finishTime - Date.now()
      if (time < 0 && !done) {
        orders[i].troop.amount--
        if (orders[i].troop.amount > 0) {
          orders[i].finishTime += t.buildTime
          time += t.buildTime
        }
        else if (time < -3000) {
          location.reload()
          done = true
        }
      }
      content.push(`<tr><td><img class="icon" title="troops" src=${t.img} /><span>${t.name} x${orders[i].troop.amount}</span></td><td class="buildTime">${timeFromDate(time)}</td></tr>`)
    }
  }
  buildTable.innerHTML = content.join("")
  let buildEntries = buildTable.getElementsByClassName('buildTime')

  content = []
  for (let i = 0; i < movements.length; i++) {
    let time = movements[i].finishTime - Date.now()
    if (time <= 0) {
      movements.splice(i, 1)
      i--
      continue
    }

    let tooltip = createTroopTooltip(movements[i].troops, movements[i].resources)
    if (movements[i].movementType == 'reinforce-from' || movements[i].movementType == 'supply-from') {
      content.push(`<tr><td><img class="icon" src="img/expand.png"/><div class="tooltip2"><span>${movements[i].endVillage.name}</span><span class="tooltiptext">${tooltip}</span></div></td><td class="troopTime">${timeFromDate(time)}</td></tr>`)
    }
    else if (movements[i].movementType == 'reinforce-to' || movements[i].movementType == 'attack-return') {
      content.push(`<tr><td><img class="icon" src="img/contract.png"/><div class="tooltip2"><span>${movements[i].endVillage.name}</span><span class="tooltiptext">${tooltip}</span></div></td><td class="troopTime">${timeFromDate(time)}</td></tr>`)
    }
    else if (movements[i].movementType == 'supply-to') {
      content.push(`<tr><td><img class="icon" src="img/loot.png"/><div class="tooltip2"><span>${movements[i].endVillage.name}</span><span class="tooltiptext">${tooltip}</span></div></td><td class="troopTime">${timeFromDate(time)}</td></tr>`)
    }
    else if (movements[i].movementType == 'attack-from') {
      content.push(`<tr><td><img class="icon" src="img/attacking.png"/><div class="tooltip2"><span>${movements[i].endVillage.name}</span><span class="tooltiptext">${tooltip}</span></div></td><td class="troopTime">${timeFromDate(time)}</td></tr>`)
    }
    else if (movements[i].movementType == 'attack-to') {
      content.push(`<tr><td><img class="icon" src="img/attacked.png"/><div class="tooltip2"><span>${movements[i].endVillage.name}</span><span class="tooltiptext">???</span></div></td><td class="troopTime">${timeFromDate(time)}</td></tr>`)
    }
    else {
      content.push(`<tr><td>${movements[i].movementType}</td><td>0</td></tr>`)
    }
  }

  troopTable.innerHTML = content.join('')
  let troopEntries = troopTable.getElementsByClassName('troopTime')

  if (orders.length > 0 || movements.length > 0)
    fakeUpdateBuildTime(buildEntries, orders, troopEntries, movements, false)
}

const fakeUpdateBuildTime = (buildEntries, orders, troopEntries, movements, done) => {
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].orderType == 'building') {
      let time = orders[i].finishTime - Date.now()
      if (time < -3000 && !done) {
        location.reload()
        done = true
      }
      buildEntries[i].innerHTML = timeFromDate(time)
    }
  }
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].orderType == 'troop') {
      let t = getTroop(orders[i].troop.troop)
      let time = orders[i].finishTime - Date.now()
      if (time < 0 && !done) {
        orders[i].troop.amount--
        if (orders[i].troop.amount > 0) {
          orders[i].finishTime += t.buildTime
          time += t.buildTime
          buildEntries[i].parentNode.innerHTML = `<tr><td><img class="icon" title="troops" src=${t.img} /><span>${t.name} x${orders[i].troop.amount}</span></td><td class="buildTime">${timeFromDate(time)}</td></tr>`
        }
        else if (time < -3000) {
          location.reload()
          done = true
        }
      }
      else {
        buildEntries[i].innerHTML = timeFromDate(time)
      }
    }
  }

  for (let i = 0; i < movements.length; i++) {
    let time = movements[i].finishTime - Date.now()
    // if (time < -3000 && !done) {
    //   location.reload()
    //   done = true
    // }
    troopEntries[i].innerHTML = timeFromDate(time)
  }

  setTimeout(() => fakeUpdateBuildTime(buildEntries, orders, troopEntries, movements, done), 1000)
}

const createTroopTooltip = (troops, resources) => {
  let tooltip = ''
  for (let i = 0; i < troops.length; i++) {
    if (troops[i].units > 0) {
      let t = getTroop(troops[i].troop)
      tooltip += `<img class="icon" src=${t.img}></img><span> ${t.name}:  ${troops[i].units}</span><br>`
    }
  }
  if (resources) {
    for (let i = 0; i < loopRes.length; i++) {
      if (resources[loopRes[i]] > 0) {
        tooltip += `<img class="icon" src=${srcRes[i]}></img><span> ${loopRes[i]}:  ${resources[loopRes[i]]}</span><br>`
      }
    }
  }
  return tooltip
}

const timeFromDate = (dateTime) => {
  if (dateTime < 0)
    return 'DONE'
  let d = new Date(dateTime)
  let hour = (d.getHours() <= 10) ? '0' + (d.getHours() - 1) : d.getHours() - 1
  let min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes()
  let sec = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds()
  return `${hour}:${min}.${sec}`
}