'use strict'

const passport = require('passport')
const express = require('express')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Horse = require('./models/horse')
const User = require('./models/user')

const { sendEmail } = require('./middleware/emailer')
const { loggedIn, redirectIfLoggedIn, isAdmin } = require('./middleware/auth')

// Serve contents of 'public' folder to the client
router.use('/public', express.static('public'))

router.get('/', loggedIn, (req, res) => {
  res.redirect('/queue')
})

router.get('/horses', loggedIn, (req, res) => {
  Horse.find()
    // sort by id (ascending)
    .sort({ id: 1 })
    .then(horses => res.render('horses.ejs', { username: req.user.username, horses: horses }))
    .catch(console.error)
})

router.get('/horse/:id', loggedIn, (req, res) => {
  Horse.findOne({ id: req.params.id })
    .then(horse => res.render('horse.ejs', { username: req.user.username, horse: horse }))
    .catch(console.error)
})

router.get('/user', loggedIn, (req, res) => {
  res.render('user.ejs', { username: req.user.username })
})

router.get('/admin', loggedIn, isAdmin, (req, res) => {
  res.render('admin.ejs', { username: req.user.username })
})

router.post('/admin-register', (req, res, next) => {
  var role = 'user'

  if (req.body.adminCheck == 'on') {
    console.log('registering admin user')
    role = 'admin'
  }

  User.register(new User({ username: req.body.username, role: role }), req.body.password, err => {
    if (err) {
      console.log('error while user register!', err)
      return next(err)
    }

    console.log('user registered!')
    res.redirect('/admin')
  })
})

router.post('/send-email', sendEmail, (req, res, next) => { })

router.get('/queue', loggedIn, (req, res) => {
  Horse.find()
    // sort by lastVisit (ascending)
    .sort({ lastVisit: 1 })
    .then(horses => res.render('queue.ejs', { username: req.user.username, horses: horses }))
    .catch(console.error)
})

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register.ejs', {})
})

router.get('/register/:token', redirectIfLoggedIn, (req, res) => {

  jwt.verify(req.params.token, process.env.JWT_KEY, (err, email) => {
    if (err) return res.sendStatus(403)
    req.email = email
  })

  res.render('register.ejs', {})
})

router.post('/register', (req, res, next) => {
  console.log('registering user')
  User.register(new User({ username: req.body.username }), req.body.password, err => {
    if (err) {
      console.log('error while user register!', err)
      return next(err)
    }

    console.log('user registered!')

    res.redirect('/login')
  })
})

router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login.ejs', { user: req.user, message: req.flash('error') })
})

router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    res.redirect('/')
  }
)

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
