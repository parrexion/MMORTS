const User = require('./User-model')
const bcrypt = require('bcrypt')
const saltRounds = 10

exports.registerUser = (req, res, next) => {
  let email = req.body.email
  let username = req.body.username
  let password = req.body.password

  console.log(`${username} : ${password} : ${email}`)

  return User.findOne({ $or: [{ username: username }, { email: email }] }).then((user) => {
    if (user) {
      if (user.email == email) res.locals.create = { res: 2 }
      else res.locals.create = { res: 1 }
      next()
    }
    else {
      createuser(username, password, email).then((result) => {
        res.locals.create = { res: 0 }
        next()
      })
    }
  })
}

exports.loginUser = (req, res, next) => {
  let username = req.body.username
  let password = req.body.password

  return User.findOne({ username })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password)
          .then((result) => {
            if (result) {
              res.locals.login = true
              req.session.loggedin = true
              req.session.user = user._id
              req.session.username = user.username
            }
            next()
          })
      }
      else {
        next()
      }
    })
}

const createuser = (username, password, email) => {
  let user = new User()
  user.username = username
  user.email = email
  user.unreadCount = 0

  return bcrypt.hash(password, saltRounds)
    .then((hash) => {
      user.password = hash
      return user.save()
    })
}