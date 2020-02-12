'use strict'

// Using the lastVisit date from the database, calculate the time since the last visit
// Set a color gradient based on the following criteria:
// lastVisit < 6 weeks (42 days) = green
// 6 weeks (42 days) < lastVisit < 8 weeks (56 days) = yellow
// lastVisit >= 8 weeks (56 days) = red
function getHex(days, rangeStart, rangeEnd, endValue) {
  let normalizedDays = (days - rangeStart) / (rangeEnd - rangeStart)
  if (endValue === 1) {
    // Puts the normalizedDays on the scale from 0-255 in hex
    normalizedDays *= 255
  } else {
    // Puts the normalizedDays on the scale from 255-0 in hex
    normalizedDays = (1 - normalizedDays) * 255
  }
  // Returns the normalizedDays in hex
  normalizedDays = Math.floor(normalizedDays)
  let hexString = normalizedDays.toString(16)
  if (hexString.length < 2) {
    hexString = '0' + hexString
  }
  return hexString
}

function lastVisitDate(horse) {
  return typeof horse.lastVisit === 'undefined' ? new Date() : horse.lastVisit
}

function computeBorderColor(horse) {
  const date = lastVisitDate(horse)
  // Get the time (in milliseconds) from the last visit to now
  const timeSinceLastVisit = new Date() - date
  // There are 86,400,000 milliseconds in a day
  const daysSinceLastVisit = Math.floor(timeSinceLastVisit / 86400000)

  let warnDays = 42
  let alertDays = 56
  let borderColor
  if (daysSinceLastVisit < warnDays) {
    // 0 days since visit is the low-limit
    // warnDays days since visit is the high-limit
    // For Green->Yellow gradient we want a hex value from 0-ff (0-255) (low-high) returned
    // Setting endValue to 1 causes getHex to normalize up from 0 to ff (0-255)
    let endValue = 1
    let hexValue = getHex(daysSinceLastVisit, 0, warnDays, endValue)
    // Sets the 'borderColor' string.
    // This is useful if you don't want to utilize the rgb() or rgba() method
    borderColor = '#' + hexValue + 'ff00'
  } else if (daysSinceLastVisit < alertDays) {
    // warnDays days since visit is the low-limit
    // alertDays days since visit is the high-limit
    // For Yellow->Red gradient we want a hex value from ff-0 (255-0) (low-high) returned
    // Setting endValue to 0 causes getHex to normalize down from 255 to 0
    let endValue = 0
    let hexValue = getHex(daysSinceLastVisit, warnDays, alertDays, endValue)
    // Sets the 'borderColor' string.
    // This is useful if you don't want to utilize the rgb() or rgba() method
    borderColor = '#ff' + hexValue + '00'
  } else {
    // Sets the 'borderColor' string.
    // This is useful if you don't want to utilize the rgb() or rgba() method
    borderColor = '#ff0000'
  }

  return borderColor
}

module.exports = { lastVisitDate, computeBorderColor }
