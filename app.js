'use strict'
const express = require("./system/express")
const scheduler = require('./system/scheduler')
const EventQueue = require('./Order/eventQueue')


let app = express.create();
var server = app.listen(3000, () => {
  scheduler.setup()
  global.queue = new EventQueue()
  queue.start(5000)
})