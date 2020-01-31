var User = require('../models/user')

var middlewareObj = {}

middlewareObj.loggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

module.exports = middlewareObj
