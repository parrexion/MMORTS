const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Ordertype = ['building', 'troop']

const orderSchema = new Schema({
  owner: String,
  village: String,
  orderType: {
    type: String,
    enum: Ordertype,
    default: 'building'
  },
  building: {
    slot: Number,
    building: Number,
    level: Number,
    _id: false
  },
  troop: {
    from: Number,
    troop: Number,
    amount: Number,
    _id: false
  },
  finishTime: Number
})



module.exports = mongoose.model('Order', orderSchema)