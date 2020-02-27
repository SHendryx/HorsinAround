'use strict'
const chai = require('chai')
chai.use(require('chai-http'))
chai.should()

const app = require('../../index')

describe('Routes', () => {
  describe('GET /horse/all', () => {
    let req
    before(() => {
      return (req = chai.request(app).get('/horse/all'))
    })

    it('should get the horses page', () => {
      return req.then(res => res.should.have.status(200))
    })
    describe('The horses page', () => {
      it('should render HTML', () => {
        return req.then(res => res.should.be.html)
      })
    })
  })

  describe('GET /horse/1', () => {
    let req
    before(() => {
      return (req = chai.request(app).get('/horse/1'))
    })

    it('should get the horse page', () => {
      return req.then(res => res.should.have.status(200))
    })
    describe('The horse page', () => {
      it('should render HTML', () => {
        return req.then(res => res.should.be.html)
      })
    })
  })

  describe('GET /', () => {
    let req
    before(() => {
      return (req = chai.request(app).get('/'))
    })

    it('should get the queue page', () => {
      return req.then(res => res.should.have.status(200))
    })

    describe('The queue page', () => {
      it('should render HTML', () => {
        return req.then(res => res.should.be.html)
      })
    })
  })

  describe('GET /user', () => {
    let req
    before(() => {
      return (req = chai.request(app).get('/user'))
    })

    it('should get the user page', () => {
      return req.then(res => res.should.have.status(200))
    })

    describe('The user page', () => {
      it('should render HTML', () => {
        return req.then(res => res.should.be.html)
      })
    })
  })

  describe('GET /horse/queue', () => {
    let req
    before(() => {
      return (req = chai.request(app).get('/horse/queue'))
    })

    it('should get the queue page', () => {
      return req.then(res => res.should.have.status(200))
    })

    describe('The queue page', () => {
      it('should render HTML', () => {
        return req.then(res => res.should.be.html)
      })
    })
  })
})
