const schedule = require('node-schedule')
const villageController = require('../Village/Village-controller')

exports.setup = () => {
  // schedule.scheduleJob('*/5 * * * *', villageController.updateResources)
  schedule.scheduleJob('0 * * * * *', villageController.updateResources)
}