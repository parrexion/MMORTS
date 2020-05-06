const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const uri = 'mongodb+srv://dbSuperman:CaZI4a8Kr6hzVBtM@matvraksbyn-nvae0.mongodb.net/test?retryWrites=true&w=majority'

exports.create = () => {
  const app = express()

  //Parsing input
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json({ strict: false }))

  //Pug setup
  app.set('views', './website/views')
  app.set('view engine', 'pug')
  app.use(express.static('./website/public'))

  //Mongo setup
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  //Session cookies
  app.use(
    session({
      secret: 's3Cur3',
      name: 'matvrak',
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      cookie: {
        secure: app.get('env') === 'production',
        httpOnly: true,
        maxAge: 3600000,
      },
    })
  )

  //Routing
  app.use(router.create())

  return app
}