'use strict'

/* Direct ESLint to ignore the following undefined (as far as it can tell) variable(s): */
/* global Hammer, userfname, userlname, users, horses */

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
 * @param {Number} width The width (in pixels) of the element that will hold the name
 * @returns {String} The (possibly) shortened name
 */
function shortenName(fname, lname, width) {
  // Approximate width of each character in pixels (err on the high side to avoid overlong names).
  // Adjust this constant to adjust how many characters of the name are shown.
  const pixelsPerChar = 10
  const charsAllowed = width / pixelsPerChar
  const fullNameLength = fname.length + lname.length + 1
  if (charsAllowed >= fullNameLength) {
    return `${fname} ${lname}`
  }
  // It takes 3 chars to show a last initial (space, initial, and '.')
  if (charsAllowed >= fname.length + 3) {
    return `${fname} ${lname.charAt(0)}.`
  }
  return `${fname.slice(0, charsAllowed - 3)} ${lname.charAt(0)}.`
}

// Fill in the names of the assigned farriers for each horse
$('.assigned-ferrier').each(function() {
  // The HTML id is set to the horse's id, so we can get it with:
  const id = $(this).attr('id')
  // Find a horse with a matching id (there should only be one)

  const horse = horses.find(horse => horse.id === Number(id))
  if (horse.assignedFarrier === undefined) {
    $(this).text('None')
  } else {
    // Get the width of the 'Assigned To' column
    const width = $(this)
      .get()[0]
      .getBoundingClientRect()
    console.log(width)
    // Get the assigned farrier
    const farrier = users.find(user => user.id === horse.assignedFarrier)
    const { fname, lname } = farrier
    $(this).text(shortenName(fname, lname, width))
  }
})

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
        $.fn.dataTable.ext.search.push(function(_, data) {
          return (
            data[3].trim() === userfname.innerText.charAt(0) + '.' + userlname.innerText.charAt(0)
          )
        })
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
      $.fn.dataTable.ext.search.push(function(_, data) {
        return (
          data[3].trim() === userfname.innerText.charAt(0) + '.' + userlname.innerText.charAt(0)
        )
      })
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
