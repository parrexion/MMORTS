const mongoose = require('mongoose')

const Schema = mongoose.Schema

let VillageSchema = new Schema({
  owner: String,
  ownerName: String,
  position: {
    x: Number,
    y: Number,
    _id: false
  },
  name: String,
  level: Number,
  resources: {
    grain: Number,
    apple: Number,
    honey: Number,
    meat: Number,
    villagers: Number,
    _id: false
  },
  production: {
    grain: Number,
    apple: Number,
    honey: Number,
    meat: Number,
    villagers: Number,
    _id: false
  },
  capacity: {
    grain: Number,
    apple: Number,
    honey: Number,
    meat: Number,
    villagers: Number,
    _id: false
  },
  buildings: [{
    building: Number,
    level: Number,
    constructing: Boolean,
    _id: false
  }],
  troops: [{
    name: String,
    troop: Number,
    units: Number,
    unavailable: Number,
    upkeep: {
      grain: Number,
      apple: Number,
      honey: Number,
      meat: Number,
      _id: false
    },
    _id: false
  }],
  refreshed: Number
})

module.exports = mongoose.model('Village', VillageSchema)