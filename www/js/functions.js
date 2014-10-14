// Array holding the names of the months of the year
var months = ["Jan", "Feb", "March", "April", "May", "June", "July", 
                "Aug", "Sept", "Oct", "Nov", "Dec"];

// Convert parameter military_time from military time (HH:MM:SS) to hh:MM AM/PM
function convertTime(military_time) {
    // Get military hours and convert to normal hours
    var hours_military = parseInt(military_time.substring(0, 2),10);
    var hours = ((hours_military + 11) % 12) + 1;
    var amPm = '';

    // If military hours is greated than 11, use PM
    if(hours_military > 11){
      amPm = 'PM';
    }
    // Otherwise, use AM
    else {
      amPm = 'AM';
    }

    // Get minutes
    var minutes = military_time.substring(3, 5);

    return hours + ':' + minutes + ' ' + amPm;
}

// Convert parameter date from yyyy-mm-dd to [month name] dd
function convertDate(date) {
    // Get month and day from date
    var month_num = parseInt(date.substring(5,7), 10);
    var day = date.substring(8);

    // Get the month name from list
    var month = months[month_num - 1];

    return month + " " + day;
}

// Convert parameter date from date object to date string (yyyy-mm-dd)
function convertDateObjToDateString(date) {
    // Get month and day from date
    var month = date.getMonth() + 1;
    var day = date.getDate();

    // In "0" in font if less than 10
    if(month < 10) {
        month = "0" + month;
    }

    if(day < 10) {
        day = "0" + day;
    }

    return date.getFullYear() + "-" + month + "-" + day;
}

// Convert parameter date from date object to time string in military time (HH:MM:SS)
function convertDateToTime(date) {
    // Get hours and minutes from date
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // Include "0" in front if less than 10
    if(hours < 10) {
        hours = "0" + hours;
    }

    if(minutes < 10) {
        minutes = "0" + minutes;
    }

    return hours + ":" + minutes + ":00";
}

// Convert parameter time from time string in military time (HH:MM:SS) to date object
function convertTimeToDate(time) {
    var hour = parseInt(time.substring(0,2), 10);
    var minute = parseInt(time.substring(3,5), 10);

    return new Date(2014, 1, 1, hour, minute, 0, 0);
}

// Convert parameter date from date string (yyyy-mm-dd) to date object
function convertDateStringToDateObj(date) {
    var year = parseInt(date.substring(0,4), 10);
    var month = parseInt(date.substring(5,7), 10) - 1;
    var day = parseInt(date.substring(8,10), 10);

    return new Date(year, month, day, 0, 0, 0, 0);
}

// Delete a reservation with given reserve_id from reservation_json in local storage
function deleteReservation(reserve_id) {
    // Get reservations JSON from local storage
    var reservations = JSON.parse(localStorage.getItem("reservation_json"));

    // Loop through reservations
    for(var i = 0; i < reservations.reservations.length; i++) {
        // If reserve_id matches, remove that reservation
        if(Number(reservations.reservations[i].reserve_id) === Number(reserve_id)) {
            reservations.reservations.splice(i,1);
        }
    }

    // Store new reservations JSON
    localStorage.setItem("reservation_json", JSON.stringify(reservations));
}

// Receives a seat_id and calculates the rating (in stars) for that seat
function getRating(seat_id) {
    // Get ratings JSON from local storage and set variable to list inside
    var ratings = JSON.parse(localStorage.getItem("ratings_json"));
    ratings = ratings.ratings;

    // Get user_id from local storage
    var user_id = localStorage.getItem("user_id");

    var rating = '';
    var sum = 0;
    var total = 0;

    // Loop through all ratings
    for(var i = 0; i < ratings.length; i++){
        // If the current user has a rating for this seat
        if(Number(ratings[i].user_id) === Number(user_id) &&
            ratings[i].seat_id === seat_id){

            // Create enough stars for their rating
            for(var j = 0; j < ratings[i].rating; j++){
                rating += '<i class="icon-star-3 rated" value="' + seat_id + '" count="' + j + '"></i>';
            }

            // Create empty stars for remaining
            for(var j = ratings[i].rating; j < 5; j++){
                rating += '<i class="icon-star rated" value="' + seat_id + '" count="' + j + '"></i>';
            }

            // Return their rating
            return rating;
        }
        else if(ratings[i].seat_id === seat_id) {
            sum += Number(ratings[i].rating);
            total++;
        }
    }

    // Initialize variables
    var average = 0;
    var floored = 0;
    var rounded = 0;

    // If there are ratings for this seat
    if(total != 0){
        // Get average rating and floor of average
        average = sum / total;
        floored = Math.floor(average);
        rounded = Math.floor(average);
    }

    // Create enough stars for the average rating
    for(var j = 0; j < floored; j++){
        rating += '<i class="icon-star-3 not_rated" value="' + seat_id + '" count="' + j + '"></i>';
    }

    // If the average had at least 0.5 more than the floor, add a half star
    if(rounded > floored){
        rating += '<i class="icon-star-2 not_rated" value="' + seat_id + '" count="' + rounded + '"></i>';
    }

    // Add empty stars for the rest
    for(var i = rounded; i < 5; i++){
        rating += '<i class="icon-star not_rated" value="' + seat_id + '" count="' + i + '"></i>';
    }

    return rating;
}

// Receives a seat_id and calculates the rating (as a number) for that seat
function getRatingNumber(seat_id) {
    // Get ratings JSON from local storage and set variable to list inside
    var ratings = JSON.parse(localStorage.getItem("ratings_json"));
    ratings = ratings.ratings;

    var rating = '';
    var sum = 0;
    var total = 0;

    // Loop through all ratings
    for(var i = 0; i < ratings.length; i++){
        if(ratings[i].seat_id === seat_id) {
            sum += Number(ratings[i].rating);
            total++;
        }
    }

    // Initialize variables
    var average = 0;
    var floored = 0;
    var rounded = 0;

    // If there are ratings for this seat
    if(total != 0){
        // Get average rating and floor of average
        average = sum / total;
        floored = Math.floor(average);
        rounded = Math.floor(average);
    }

    // If the average had at least 0.5 more than the floor, add a half star
    if(rounded > floored){
        return floored + ".5";
    }
    else if(floored === 0) {
        return "--";
    }
    else {
        return floored;
    }
}

// Receives a seat_id and a rating and adds an entry in the ratings JSON with this info for the current user
function makeRating(seat_id, rating){
    // Get ratings JSON and user_id from local storage
    var ratings = JSON.parse(localStorage.getItem("ratings_json"));
    var user_id = localStorage.getItem("user_id");

    // Get next rating_id
    var rating_id = Number(ratings.ratings[ratings.ratings.length - 1].rating_id) + 1;

    // Loop through ratings and delete any for this user if one exists
    for(var i = 0; i < ratings.ratings.length; i++){
        // If user_id matches, delete rating
        if(ratings.ratings[i].user_id === user_id){
            ratings.ratings.splice(i,1);
        }
    }

    // Create new rating object and push onto ratings list
    var rating = {"seat_id" : seat_id, "rating_id" : rating_id, "user_id" : user_id, "rating" : rating};
    ratings.ratings.push(rating);

    // Store modified ratings in local storage
    localStorage.setItem("ratings_json", JSON.stringify(ratings));
}

// Updates the number in the notification for the user's reservations in the navigation panel
function updateResNotify(){
    // Get user_id and reservations from local storage
    var user_id = localStorage.getItem("user_id");
    var reservations = JSON.parse(localStorage.getItem("reservation_json"));

    reservations = reservations.reservations;

    var user_res = 0;
    var today = convertDateObjToDateString(new Date());

    // Loop through reservations
    for (var i = reservations.length - 1; i >= 0; i--) {
        // If the reservation is for the current user today, add to user_res
        if (reservations[i].user_id == user_id &&
            reservations[i].date === today){
            user_res++;
        }
    }

    // If the user has reservations today, display a notification
    if(user_res > 0){
        $('.nav_page .notify').show();
        $('.nav_page .notify').html(user_res);
    }
    // Otherwise, hide the notification
    else {
        $('.nav_page .notify').hide();
    }
}

// Update the rating number in the column of the FooTable on the makeReservation page
function updateRatingNumber(seat_id, rating){
    var row = $('tr:not(.footable-row-detail)#seat_' + seat_id);
    row.children().eq(2).children('span').html(rating);
}

// Show picture of seat for seat details
function showPicture(seat_id){
   $('#picture').remove();

   var seats = JSON.parse(localStorage.getItem("seats_json"));
   var types = JSON.parse(localStorage.getItem("types_json"));

   seats = seats.seats;
   types = types.types;

   var type_id = Number(types[types.length-1].type_id) + 1;

   var page_id = $.mobile.activePage.attr('id');

   for(var i = 0; i < seats.length; i++){
      if(seats[i].seat_id === seat_id){
         for(var j = 0; j < types.length; j++){
            if(seats[i].type_id === types[j].type_id){
               
               var image = '<img src ="' + types[j].img + '" id="picture">';
               $('#' + page_id + ' div.ui-content').append(image);
               break;
            }
         }
      }
   }

   $('div.pop_up_haze').show();
   $('#picture').show();
}

// Show picture of seat for seat details
function showMap(seat_id){
    console.log(seat_id);
   $('#picture').remove();
   var page_id = $.mobile.activePage.attr('id');

   var image = '<img class="map" src="img/MapPictures/' + seat_id + '.PNG" id="picture"/>';

    $('#' + page_id + ' div.ui-content').append(image);

    console.log(image);

   $('div.pop_up_haze').show();
   $('#picture').show();
}

// Get random number between with high of max
function getRandomArbitrary(max) {
  return Math.random() * max;
}


// Show confirmation window for a seat and save reservation info in reservation
function showSeatInfo(seat_id){
   $('#pop_up div').remove();

   // Create structure for pop up
   var pop_up_info = '<div class="search_info">' +
                        '<span class="icon-calendar date_time_symbol"></span>' +
                        '<span class="confirm_info" id="confirm_date"></span>' +
                     '</div>' +
                     '<div class="search_info">' +
                        '<span class="icon-clock date_time_symbol"></span>' +
                        '<span class="confirm_info" id="confirm_time"></span>' +
                     '</div>' +
                     '<div class="toMakeReserve>' +
                        '<span class="confirm_arrow icon-arrow-right-5"></span>' +
                        '<span class="swipe_to_confirm">Swipe to Confirm</span>' +
                        '<span class="confirmed">Confirmed!</span>' +
                     '</div>'
                     '<button class="make_reservation row_icon">' +
                            '<span class="ui-icon ui-icon-plus ui-btn-icon-notext ui-icon-transparent"></span>' +
                    '</button>';

   // Append pop up information to the pop up and run slider() on the confirmation slider
   $('#pop_up').append(pop_up_info);

   localStorage.setItem("current_seat", seat_id);

   // Get seats, reservations, and types JSONs
   var seats = JSON.parse(localStorage.getItem("seats_json"));
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   var types = JSON.parse(localStorage.getItem("types_json"));

   // Set variables to lists inside JSONs
   seats = seats.seats;
   reservations = reservations.reservations;
   types = types.types;

   // Show black haze and pop up window
   $('div.pop_up_haze').show();
   $('#pop_up').show();
}