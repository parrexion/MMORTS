const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MovementType = ['trade', 'reinforce-from', 'reinforce-to', 'attack-from', 'attack-to', 'attack-return', 'supply-from', 'supply-to']

const movementSchema = new Schema({
  owner: String,
  movementType: {
    type: String,
    enum: MovementType,
    default: 'attack'
  },
  startVillage: {
    id: String,
    name: String,
    _id: false
  },
  endVillage: {
    id: String,
    name: String,
    _id: false
  },
  troops: [{
    troop: Number,
    units: Number,
    _id: false
  }],
  resources: {
    grain: Number,
    apple: Number,
    honey: Number,
    meat: Number,
    _id: false
  },
  finishTime: Number
})


module.exports = mongoose.model('Movement', movementSchema)