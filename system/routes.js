const express = require('express')
const config = require('../config/serverSettings')
const sessions = require('./sessions')
const UserController = require('../User/User-controller')
const villageController = require('../Village/Village-controller')
const messageController = require('../Message/Message-controller')
const mapController = require('../Map/Map-controller')
const battleController = require('../Battle/Battle-controller')
const User = require('../User/User-model')
const Village = require('../Village/Village-model')

exports.create = () => {
  const router = express.Router()

  router.get('/', function(req, res) {
    if (req.session && req.session.loggedin)
      res.redirect('/game')
    else
      res.redirect('/login')
  })

  router.get('/wurld',
    sessions.checkCookie,
    function(req, response) {
      return villageController.createVillage(req.session)
        .then((res) => {
          response.send(JSON.stringify('Success'))
        })
        .catch((err) => response.send('Failed'))
    }
  )

  router.get('/login', function(req, res) {
    return res.render('login.pug')
  })

  router.get('/register', function(req, res) {
    return res.render('register.pug')
  })

  router.get('/logout',
    function(req, res) {
      req.session.destroy()
      return res.redirect('/login')
    })

  router.post('/auth-login',
    UserController.loginUser,
    function(req, res) {
      if (res.locals.login)
        return res.redirect('/game')
      else
        return res.render('login.pug', { error: 1 })
    }
  )

  router.post('/auth-reg',
    UserController.registerUser,
    function(req, res) {
      return res.render('register.pug', { create: res.locals.create })
    }
  )

  router.get('/game',
    sessions.checkCookie,
    function(req, response) {
      if (config.maintenance)
        return response.render('maintenance.pug')

      return User.findOne({ _id: req.session.user })
        .then((user) => {
          return Village.find({ owner: req.session.user })
            .then((res) => {
              if (req.query.village)
                req.session.villageIndex = req.query.village
              else if (!req.session.villageIndex)
                req.session.villageIndex = 0
              req.session.village = res[req.session.villageIndex]._id
              let orders = global.queue.getVillageOrders(req.session.village)
              let movements = global.queue.getVillageMovements(req.session.village)
              if (req.query.village) {
                response.render('village.pug', { layout: false, data: res, selected: req.session.villageIndex, orders, movements }, function(error, html) {
                  response.render('tabs.pug', { layout: false, unread: user.unreadCount }, function(error, tabs) {
                    response.send({ html, tabs, data: res[req.query.village], orders, movements })
                  })
                })
              }
              else {
                response.render('villageLayout.pug', { data: res, selected: req.session.villageIndex, orders, movements, unread: user.unreadCount })
              }
            })
        })
    }
  )

  router.get('/build',
    sessions.checkCookie,
    villageController.buildBuilding
  )
  router.get('/upgrade',
    sessions.checkCookie,
    villageController.upgradeBuilding
  )
  router.get('/train',
    sessions.checkCookie,
    villageController.trainTroops
  )

  router.get('/inbox',
    sessions.checkCookie,
    messageController.getMessages
  )

  router.post('/pm',
    sessions.checkCookie,
    messageController.sendMessage
  )

  router.delete('/pm-delete',
    sessions.checkCookie,
    messageController.removeMessage
  )

  router.get('/map',
    sessions.checkCookie,
    mapController.generateMap
  )

  router.post('/send',
    sessions.checkCookie,
    battleController.sendTroops
  )

  return router
}