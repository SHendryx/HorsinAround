'use strict'

/* Direct ESLint to ignore the following undefined (as far as it can tell) variable(s): */
/* global Hammer, horses, user, users */

/**
 * Shorten the user's name based on the width of the container it will be displayed in.
 *
 * Displays as many characters of the first name as it can, and either the last initial, or the full
 * last name if there is enough space for the entire name (first and last).
 *
 * Note: this makes a _guess_ at how many characters can probably be displayed. It may not be
 * perfect. We will try to err on the side of too short rather than too long, to avoid overlapping
 * text.
 * @param {String} fname First name
 * @param {String} lname Last name
 * @param {Number} width The width of the window
 * @returns {String} The (possibly) shortened name
 */
function shortenName(fname, lname, width) {
  // We don't know the exact width of the element, so we approximate how many characters we can fit
  // loosely based on the width of the window. Change this conversion factor if it's too short or
  // too long.
  const conversionFactor = 1 / 77
  // Set a minumum number of characters to 5 (Two initials, two dots and a space - i.e. "M. D.")
  const charsAllowed = width * conversionFactor < 5 ? 5 : width * conversionFactor

  const fullNameLength = fname.length + lname.length + 1
  if (charsAllowed >= fullNameLength) {
    return `${fname} ${lname}`
  }
  // It takes 3 chars to show a last initial (space, initial, and '.')
  if (charsAllowed >= fname.length + 3) {
    return `${fname} ${lname.charAt(0)}.`
  }
  // Truncate first name to length charsAllowed - 4 (leaving 4 chars for last initial part)
  return `${fname.slice(0, charsAllowed - 4)}. ${lname.charAt(0)}.`
}

/**
 * Fill in the names of the assigned farriers for each horse
 */
function showAssignedFarriers() {
  // Get the width (in pixels) of the browser window
  const width = $(window).width()

  $('.assigned-farrier').each(function() {
    // The HTML id is set to the horse's id, so we can get it with:
    const id = $(this).attr('id')
    // Find a horse with a matching id (there should only be one)
    const horse = horses.find(horse => horse.id === Number(id))

    if (horse.assignedFarrier === undefined) {
      $(this).text('None')
    } else {
      // Get the assigned farrier
      const farrier = users.find(user => user.id === horse.assignedFarrier)
      const { fname, lname } = farrier
      $(this).text(shortenName(fname, lname, width))
    }
  })
}

showAssignedFarriers()

$(window).resize(showAssignedFarriers)

/**
 * Filters the queue to show only the horses assigned to the current user.
 * Uses a custom DataTable search to filter down the list.
 */
function filterAssigned() {
  // In order to filter by "Assigned To Me", we effectively do a custom search for all horses
  // assigned to the logged in user. queueRow[3] is the part of the table row that containst
  // the horse's id.
  $.fn.dataTable.ext.search.push((_, __, ___, queueRow) => {
    // queueRow[3] is the raw html text of the "Assigned To" column of the current row.
    // Extract the horse's id number from the html:
    const horseId = Number(queueRow[3].match(/id="([0-9]+)"/)[1])
    // Get the horse with that id.
    const horse = horses.find(horse => horseId === horse.id)
    // Return true if this horse is assigned to the logged in user.
    // (Returning true adds this row to the "search results").
    return user._id === horse.assignedFarrier
  })
}

$(document).ready(function() {
  var table = $('#queue').DataTable({
    responsive: {
      details: true
    },
    order: [[2, 'asc']],
    bPaginate: false,
    stateSave: true,
    //rowReorder: true,
    columnDefs: [
      { responsivePriority: 1, targets: 0 },
      { responsivePriority: 2, targets: -1 },
      { responsivePriority: 3, targets: 2 }
    ],

    dom: '<"row"<"col"<"checkbox-area">><"col"fr>>tilpr',
    initComplete: function() {
      if (localStorage.input === 'true') {
        filterAssigned()
      }
    }
  })
  $('div.checkbox-area').html(
    `<input id="view-assigned" class ="form-check-input" type="checkbox" View Assigned Horses>
     <label class="form-check-label" for="checkbox">View Assigned Horses</label>`
  )

  table.draw()

  $('#view-assigned').on('change', function() {
    if ($(this).is(':checked')) {
      filterAssigned()
    } else {
      $.fn.dataTable.ext.search.pop()
    }
    table.draw()
  })
  $(function() {
    var test = localStorage.input === 'true' ? true : false
    $('#view-assigned').prop('checked', test || false)
  })

  $('#view-assigned').on('change', function() {
    localStorage.input = $(this).is(':checked')
  })

  function dismiss(event) {
    const url = '/horse/dismiss' + event.target.id
    console.log(event.target.id)
    $.post(url, function() {
      location.reload()
    })
  }

  var element = document.getElementById('queue-body')
  var hammertime = new Hammer(element)
  hammertime.on('swiperight', dismiss)
})
