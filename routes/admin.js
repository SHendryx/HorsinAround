'use strict'

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { isAdmin, sendRegistrationEmail, loggedIn } = require('../middleware/auth')

router.use(loggedIn, isAdmin)
router.use('/public', express.static('public'))

router.get('/', async (req, res) => {
  const users = await User.find().sort({ lname: 1, username: 1 })
  res.render('admin.ejs', { username: req.user.username, users })
})

router.get('/users', async (req, res) => {
  const users = await User.find().sort({ lname: 1, username: 1 })
  res.render('user-management.ejs', { username: req.user.username, users })
})

router.post('/send-email', sendRegistrationEmail)

module.exports = router
