'use strict'
//Import NPM modules
const express = require('express')
const router = express.Router()

//Import mongoose models
const Medical = require('../models/medical')
const Horse = require('../models/horse')
const Image = require('../models/image')

//import middlewares
const { loggedIn } = require('../middleware/auth')

const multer = require('multer')
const cloudinary = require('cloudinary')
const cloudinaryStorage = require('multer-storage-cloudinary')

//Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
})

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'dev-bojack',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
})

const parser = multer({ storage: storage })

router.use('/public', express.static('public'))

//Setup Routes
router.get('/queue', loggedIn, (req, res) => {
  Horse.find()
    // sort by lastVisit (ascending)
    .sort({ lastVisit: 1 })
    .then(horses =>
      res.render('queue.ejs', {
        username: req.user.username,
        horses: horses,
        scripts: require('../scripts/queue-item')
      })
    )
    .catch(console.error)
})

router.get('/all', loggedIn, (req, res) => {
  Horse.find()
    // sort by id (ascending)
    .sort({ id: 1 })
    .then(horses => res.render('horses.ejs', { horses: horses }))
    .catch(console.error)
})

router.get('/new', loggedIn, (req, res) => {
  res.render('new-horse.ejs')
})

router.post('/new', loggedIn, parser.single('image'), (req, res) => {
  if (req.file) {
    const horse = new Horse(req.body)
    const image = new Image({
      ref_id: horse._id,
      onType: 'horses',
      url: req.file.url,
      public_id: req.file.public_id
    })
    horse.image = image._id
    horse.save()
    image.save()
  } else {
    Horse.create(req.body)
  }
  res.redirect('/horse/all')
})

router.get('/:id', loggedIn, (req, res) => {
  Horse.findOne({ id: req.params.id })
    .populate('image')
    .then(horse => res.render('horse.ejs', { horse: horse }))
    .catch(console.error)
})

router.get('/:id/new-medical-analysis', loggedIn, (req, res) => {
  Horse.findOne({ id: req.params.id })
    .then(horse => res.render('new-medical-analysis.ejs', { horse }))
    .catch(console.error)
})

router.post('/:id/new-medical-analysis', loggedIn, (req, res) => {
  console.log(req.body)
  new Medical({
    horse_id: req.params.id,
    date: new Date(),
    farrier: 'Default Steve',
    ...req.body
  }).save(console.error)
  res.redirect(`/horse/${req.params.id}`)
})

router.get('/:id/new-shoeing', loggedIn, (req, res) => {
  res.render('new-shoeing.ejs')
})

router.get('/:id/update', loggedIn, (req, res) => {
  Horse.findOne({ id: req.params.id })
    .then(horse => res.render('update-horse.ejs', { horse, name: req.user.username }))
    .catch(console.error)
})

router.post('/:id/update', loggedIn, (req, res) => {
  console.log(req.body)
  Horse.findOne({ id: req.params.id }).then(horse => {
    horse.name = req.body.name
    horse.gender = req.body.gender
    horse.temperament = req.body.temperament
    horse.discipline = req.body.discipline
    horse.location = req.body.location
    horse.owner = req.body.owner
    horse.vet = req.body.vet
    horse.history = req.body.history
    horse.save()
  })
  res.redirect(`/horse/${req.params.id}`)
})
module.exports = router
