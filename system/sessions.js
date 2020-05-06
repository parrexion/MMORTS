const chalk = require('chalk')

exports.checkCookie = (req, res, next) => {
  // console.log(`Auth: ${JSON.stringify(req.headers)}`)
  // console.log(chalk.yellow(`Session: ${JSON.stringify(req.session)}`))
  if (req.session && req.session.loggedin) {
    // console.log(chalk.green('Session is OK'))
    next()
  }
  else {
    console.log(chalk.red('Need to log in!'))
    res.send('Please login to view this page!')
  }
}