'use strict'
//Import NPM modules
const express = require('express')
const router = express.Router()

//Import mongoose models
const Medical = require('../models/medical')
const Horse = require('../models/horse')
const Horseshoe = require('../models/horseshoe')
const Shoeing = require('../models/shoeing')
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
  const createdDate = { lastVisit: new Date() }
  const newHorse = Object.assign(createdDate, req.body)

  if (req.file) {
    const horse = new Horse(newHorse)
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
    Horse.create(newHorse)
  }
  res.redirect('/horse/all')
})

router.get('/:id', loggedIn, (req, res) => {
  Promise.all([
    Horse.findOne({ id: req.params.id }).populate('image'),
    Medical.find({ horse_id: req.params.id }).sort({ date: -1 }),
    Shoeing.find({ horse_id: req.params.id }).sort({ date: -1 })
  ])
    //sorts medicals by most recent date first
    .then(values => {
      const [horse, medicals, shoeings] = values
      const updateable = medicals.length !== 0
      const medical = medicals[0] //grab the first medical report
      const shoeing = shoeings[0]
      res.render('horse.ejs', { horse, medical, shoeing, updateable })
    })
    .catch(console.error)
})

router.get('/:id/new-medical-analysis', loggedIn, (req, res) => {
  Promise.all([
    Horse.findOne({ id: req.params.id }),
    Medical.find({ horse_id: req.params.id }).sort({ date: -1 })
  ]) //sorts medicals by most recent date first
    .then(values => {
      const [horse, medicals] = values
      const updateable = medicals.length !== 0
      const medical = medicals[0] //grab the first medical report
      res.render('new-medical-analysis.ejs', { horse, medical, updateable })
    })
    .catch(console.error)
})

router.post('/:id/new-medical-analysis', loggedIn, (req, res) => {
  console.log(req.body)
  const medical = new Medical({
    horse_id: req.params.id,
    date: new Date(),
    farrier: 'Default Steve',
    ...req.body
  })
  medical.save(console.error)

  //When you make a new medical, update horses last visit date.
  Horse.findOne({ id: req.params.id }, (err, horse) => {
    if (err) {
      console.log(err)
      res.redirect(`/horse/${req.params.id}`)
    }
    horse.lastVisit = medical.date
    horse.save(err => {
      if (err) {
        console.log(err)
      }
    })
  })

  res.redirect(`/horse/${req.params.id}`)
})

router.get('/:id/new-shoeing', loggedIn, (req, res) => {
  res.render('new-shoeing.ejs')
})

router.post('/:id/new-shoeing', loggedIn, (req, res) => {
  console.log(req.body)
  const shoeing = new Shoeing({
    horse_id: req.params.id,
    date: new Date(), //returns todays date
    farrier: 'Default Steve',
    frontLeft: new Horseshoe({
      jobType: req.body.frontLeftShoe, //full, half, trim
      shoeSize: req.body.frontLeftSize,
      notes: req.body.frontLeftNotes,
      hoofImage1: null,
      hoofImage2: null
    }),
    frontRight: new Horseshoe({
      jobType: req.body.frontRightShoe,
      shoeSize: req.body.frontRightSize,
      notes: req.body.frontRightNotes,
      hoofImage1: null,
      hoofImage2: null
    }),
    backLeft: new Horseshoe({
      jobType: req.body.backLeftShoe,
      shoeSize: req.body.backLeftSize,
      notes: req.body.backLeftNotes,
      hoofImage1: null,
      hoofImage2: null
    }),
    backRight: new Horseshoe({
      jobType: req.body.backRightShoe,
      shoeSize: req.body.backRightSize,
      notes: req.body.backRightNotes,
      hoofImage1: null,
      hoofImage2: null
    }),

    ...req.body
  })
  shoeing.save(console.error)

  //When you make a new shoeing, update horses last visit date.
  Horse.findOne({ id: req.params.id }, (err, horse) => {
    if (err) {
      console.log(err)
      res.redirect(`/horse/${req.params.id}`)
    }
    horse.lastVisit = shoeing.date
    horse.save(err => {
      if (err) {
        console.log(err)
      }
    })
  })

  res.redirect(`/horse/${req.params.id}`)
})

router.get('/:id/update', loggedIn, (req, res) => {
  Horse.findOne({ id: req.params.id })
    .then(horse => res.render('update-horse.ejs', { horse, name: req.user.username }))
    .catch(console.error)
})

router.post('/:id/update', parser.single('image'), loggedIn, (req, res) => {
  console.log(req.file)
  if (req.file) {
    Horse.findOne({ id: req.params.id })
      .then(horse => {
        horse.name = req.body.name
        horse.gender = req.body.gender
        horse.temperament = req.body.temperament
        horse.discipline = req.body.discipline
        horse.location = req.body.location
        horse.owner = req.body.owner
        horse.vet = req.body.vet
        horse.history = req.body.history
        horse.save()
        return horse.image
      })
      .then(image_id => {
        Image.findOne({ _id: image_id }).then(image => {
          image.url = req.file.url
          image.public_id = req.file.public_id
          image.save()
        })
      })
  } else {
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
  }
  res.redirect(`/horse/${req.params.id}`)
})
module.exports = router
