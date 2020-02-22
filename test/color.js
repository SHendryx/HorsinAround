'use strict'

const rewire = require('rewire')
const chai = require('chai')
chai.should()

const color = rewire('../scripts/color.js')

const isUpperCase = color.__get__('isUpperCase')
const toKebabCase = color.__get__('toKebabCase')

const { colorStyle, themes } = color

describe('Color module', () => {
  describe('isUpperCase', () => {
    it('Should return true for [A-Z]', () => {
      isUpperCase('A').should.be.true
      isUpperCase('G').should.be.true
      isUpperCase('Z').should.be.true
    })
    it('Should return false for [a-z]', () => {
      isUpperCase('a').should.be.false
      isUpperCase('p').should.be.false
      isUpperCase('z').should.be.false
    })
    it('Should return false for non-alphabetic characters', () => {
      isUpperCase('.').should.be.false
      isUpperCase('/').should.be.false
      isUpperCase('-').should.be.false
    })
  })

  describe('toKebabCase', () => {
    it('Should do nothing to a string with no upper case characters', () => {
      toKebabCase('stringone').should.equal('stringone')
      toKebabCase('stringtwo').should.equal('stringtwo')
    })
    it('Should convert short camelCase strings to kebab-case', () => {
      toKebabCase('stringOne').should.equal('string-one')
      toKebabCase('stringTwo').should.equal('string-two')
    })
    it('Should convert long camelCase strings to kebab-case', () => {
      toKebabCase('aMultiWordString').should.equal('a-multi-word-string')
      toKebabCase('aStringWithQuiteAFewWords').should.equal('a-string-with-quite-a-few-words')
    })
  })

  describe('themes', () => {
    it('Should return type [{ name: String, selected: Boolean }]', () => {
      themes().should.be.an('array')
      themes().forEach(theme => {
        theme.should.have.property('name')
        theme.should.have.property('selected')
      })
    })
    it('Should have a Dark theme', () => {
      const hasDarkTheme = themes().some(theme => theme.name === 'Dark')
      hasDarkTheme.should.be.true
    })
    it('Should have a Light theme', () => {
      const hasLightTheme = themes().some(theme => theme.name === 'Light')
      hasLightTheme.should.be.true
    })
    describe('Selecting themes', () => {
      it("Should select the Dark theme when called with 'Dark'", () => {
        const selectedThemes = themes('Dark').filter(theme => theme.selected === true)
        selectedThemes.length.should.equal(1)
        selectedThemes[0].name.should.equal('Dark')
      })
      it("Should select the Light theme when called with 'Light'", () => {
        const selectedThemes = themes('Light').filter(theme => theme.selected === true)
        selectedThemes.length.should.equal(1)
        selectedThemes[0].name.should.equal('Light')
      })
    })
  })

  describe('colorStyle', () => {
    it('Should return a string', () => {
      colorStyle().should.be.a('string')
    })
  })
})
