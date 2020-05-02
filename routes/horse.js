'use strict'
//Import NPM modules
const express = require('express')
const router = express.Router()

//Import mongoose models
const Medical = require('../models/medical')
const Horse = require('../models/horse')
const User = require('../models/user')
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

const parser = multer({ storage })

router.use('/public', express.static('public'))

// Setup Routes
router.get('/queue', loggedIn, async (req, res) => {
  const [horses, users] = await Promise.all([
    // Returns all horses to populate View All queue
    Horse.find({ deleted: false }).sort({ lastVisit: 1 }),
    // Returns only horses assigned to you for View Assigned Horse queue
    User.find({})
  ])
  const prunedUsers = users.map(user => ({
    fname: user.fname !== undefined && user.fname !== '' ? user.fname : 'NoFirstName',
    lname: user.lname !== undefined && user.lname !== '' ? user.lname : 'NoLastName',
    id: user.id
  }))

  res.render('queue.ejs', {
    user: req.user,
    horses,
    users: prunedUsers,
    scripts: require('../scripts/queue-item')
  })
})

router.get('/all', loggedIn, async (_, res) => {
  // Get all horses and sort them by id (ascending)
  const horses = await Horse.find({ deleted: false })
    .sort({ id: 1 })
    .populate('image')
  res.render('horses.ejs', { horses: horses })
})

router.get('/new', loggedIn, (_, res) => {
  res.render('new-horse.ejs')
})

router.post('/new', loggedIn, parser.single('image'), async (req, res) => {
  // Create a new horse with all fields from the 'horse/new' page (req.body),
  // and 'lastVisit' set to now.
  const horse = new Horse({ lastVisit: new Date(), ...req.body })

  if (req.file) {
    const image = new Image({
      ref_id: horse._id,
      onType: 'horses',
      url: req.file.url,
      public_id: req.file.public_id
    })
    horse.image = image._id
    image.save()
  }
  await horse.save()

  if (req.body.submit === 'shoeing') {
    res.redirect(`/horse/${horse.id}/new-shoeing`)
  } else {
    res.redirect('/horse/all')
  }
})

router.get('/:id', loggedIn, async (req, res) => {
  const [horse, medicals, shoeings] = await Promise.all([
    Horse.findOne({ id: req.params.id }).populate('image'),
    Medical.find({ horse_id: req.params.id }).sort({ date: -1 }),
    Shoeing.find({ horse_id: req.params.id }).sort({ date: -1 })
  ])
  if (horse.deleted) {
    res.redirect('/horse/all')
  } else {
    res.render('horse.ejs', {
      horse,
      medical: medicals[0],
      shoeings: shoeings,
      updateable: medicals.length !== 0
    })
  }
})

router.get('/:id/new-medical-analysis', loggedIn, async (req, res) => {
  const [horse, medical] = await Promise.all([
    Horse.findOne({ id: req.params.id }),
    // Get the most recent medical analysis
    Medical.findOne({ horse_id: req.params.id }).sort({ date: -1 })
  ])
  res.render('new-medical-analysis.ejs', { horse, medical, updateable: !!medical })
})

router.post('/:id/new-medical-analysis', loggedIn, async (req, res) => {
  const medical = new Medical({
    horse_id: req.params.id,
    date: new Date(),
    farrier: 'Default Steve',
    ...req.body
  })
  medical.save()
  // When you make a new medical, update horse's last visit date.
  const horse = await Horse.findOne({ id: req.params.id })
  horse.lastVisit = medical.date
  horse.save()
  res.redirect(`/horse/${req.params.id}`)
})

router.get('/:id/new-shoeing', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  res.render('new-shoeing.ejs', { horse })
})

router.post('/:id/new-shoeing', loggedIn, async (req, res) => {
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
  shoeing.save()

  //When you make a new shoeing, update horses last visit date.
  const horse = await Horse.findOne({ id: req.params.id })
  horse.lastVisit = shoeing.date
  horse.save()
  res.redirect(`/horse/${req.params.id}`)
})

router.get('/:id/update', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  res.render('update-horse.ejs', { horse, name: req.user.username })
})

router.post('/:id/update', parser.single('image'), loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  horse.name = req.body.name
  horse.gender = req.body.gender
  horse.temperament = req.body.temperament
  horse.discipline = req.body.discipline
  horse.location = req.body.location
  horse.owner = req.body.owner
  horse.vet = req.body.vet
  horse.history = req.body.history
  horse.save()
  if (req.file) {
    const image = await Image.findOne({ _id: horse.image })
    image.url = req.file.url
    image.public_id = req.file.public_id
    image.save()
  }
  res.redirect(`/horse/${req.params.id}`)
})

router.post('/assign/:id', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  if (horse.assignedFarrier == -1 || horse.assignedFarrier === undefined) {
    horse.assignedFarrier = String(req.user.id)
    await horse.save(err => {
      console.log(err)
    })

    console.log(
      `Assigning horse '${horse.name}' to farrier '${req.user.fname + ' ' + req.user.lname}'.`
    )
  } else if (horse.assignedFarrier != req.user.id) {
    const assignedFarrier = await User.findOne({ _id: horse.assignedFarrier })

    console.log(
      `Horse '${horse.name}' is already assigned to farrier '${assignedFarrier.fname +
        ' ' +
        assignedFarrier.lname}'.`
    )
  }
  res.redirect(`/horse/queue/`)
})

router.post('/unassign/:id', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  if (horse.assignedFarrier === undefined) {
    console.log('Horse is not assigned a farrier')
    res.redirect(`/horse/queue/`)
  } else {
    const assignedFarrier = await User.findOne({ _id: horse.assignedFarrier })
    //admins can un-assign any horse from any user
    if (req.user.role === 'admin') {
      horse.assignedFarrier = undefined
      //only allow users to un-assign farrier if they are assigned to the horse
    } else if (horse.assignedFarrier === req.user.id) {
      horse.assignedFarrier = undefined
    }
    horse.save()
    console.log(
      `Unassigned horse '${horse.name}' from farrier '${assignedFarrier.fname +
        ' ' +
        assignedFarrier.lname}'`
    )

    res.redirect(`/horse/queue/`)
  }
})

router.post('/dismiss/:id', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  horse.lastVisit = new Date()
  if (horse.assignedFarrier === req.user.id) {
    horse.assignedFarrier = undefined
    await horse.save()
    console.log(`Unassigned horse '${horse.name}' from farrier '${req.user.username}'`)
  } else {
    await horse.save()
    console.log(`${horse.name} dismissed`)
  }
  res.redirect(`/horse/queue`)
})

router.post('/delete/:id', loggedIn, async (req, res) => {
  const horse = await Horse.findOne({ id: req.params.id })
  horse.deleted = true
  horse.save()
  console.log(`Deleting horse: '${horse.name}`)

  res.redirect(`/horse/all/`)
})

module.exports = router
