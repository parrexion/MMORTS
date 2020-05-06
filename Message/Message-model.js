const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageType = ['text', 'loot', 'death', 'plunder', 'defend', 'reinforce', 'trade', 'building']

const MessageSchema = new Schema({
  messageType: {
    type: String,
    enum: messageType,
    default: 'text'
  },
  recipient: String,
  sender: String,
  topic: String,
  message: String,
  createdAt: Number
})

module.exports = mongoose.model('Message', MessageSchema)