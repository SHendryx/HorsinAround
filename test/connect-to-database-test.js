'use strict'
const mongoose = require('mongoose')
const config = require('../config/config.js')
let Horse = require('../models/horse') //imports the horse model.

describe('Database tests', function() {
  before(function(done) {
    mongoose.connect(config.mongo_url)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error'))
    db.once('open', function() {
      console.log('We are connected to test database!')
      done()
    })
  })

  after(done => {
    mongoose.connection.close()
    done()
  })

  describe('Test Creation and Reading from db', function() {
    //Save object with 'name' value of 'dummyHorse"
    it('New name saved to test database', function(done) {
      var testName = Horse({
        name: 'dummyHorse'
      })
      testName.save(done)
    })

    it('Should retrieve data from test database', function(done) {
      //Look up the 'dummyHorse' object previously saved.
      Horse.find({ name: 'dummyHorse' }, (err, name) => {
        if (err) {
          throw err
        }
        if (name.length === 0) {
          throw new Error('No data!')
        }
        done()
      })
    })

    it('Should remove the dummyHorse entry from database', function(done) {
      Horse.deleteOne({ name: 'dummyHorse' }, (err, obj) => {
        if (err) {
          throw err
        }
        done()
      })
    })
  })
})
