const Village = require('../Village/Village-model')

const mapSize = 7

exports.generateMap = (req, res, next) => {
  let slots = []
  for (let i = 0; i < mapSize; i++) {
    let subSlots = []
    for (let j = 0; j < mapSize; j++) {
      subSlots.push({
        id: '',
        owner: '',
        name: '',
        level: '',
        state: -1
      })
    }
    slots.push(subSlots)
  }

  return Village.find({})
    .then((villages) => {
      for (let i = 0; i < villages.length; i++) {
        let state = (villages[i].id == req.session.village) ? 2 : (req.session.user == villages[i].owner) ? 1 : 0
        slots[villages[i].position.x][villages[i].position.y] = {
          id: villages[i].id,
          owner: villages[i].ownerName,
          name: villages[i].name,
          level: villages[i].level,
          state: state
        }
      }
      res.render('mapPackage', { maps: slots })
    })
}