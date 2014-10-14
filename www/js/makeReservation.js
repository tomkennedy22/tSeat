// Empty reservation, used to store new reservation
var reservation = {"reserve_id":"", "seat_id":"", "user_id":"", "date":"", "start_time":"", "end_time":""};

// Reservation holder, used when changing a reservation
var h_reservation = null;

// Seat_id if the user came from map
var current_seat = null;

// Determines whether a reservation is currently being changed
var changing = false;

// Determines if a reservation is being made from the map
var from_map = false;

// When document is "ready"
$(document).on('pageinit', '#makeReservationPage', function(){
   // When the search form is submitted
   $(document).off('tap', '#find_seat').on('tap', '#find_seat', function(event){
      event.preventDefault();
      // Get start and end time from datebox
      // Convert the date object received to time format
      var start_time = convertDateToTime($('#search_start_time').datebox('getTheDate'));
      var end_time = convertDateToTime($('#search_end_time').datebox('getTheDate'));

      // If the start time is after the end time, the time is invalid
      if(start_time > end_time){
         // Shows an error message
         alert("Invalid time.");
      }
      // Otherwise, the search is performed
      else {
         if(changing){
            editReservation();
         }
         else if(from_map){
            reserveFromMap();
         }
         else {
            // Get and show results
            getResults();
         }  
      }
   });

   // When "Search Options" is clicked
   $(document).off('tap', '#alter_search, #alter_search h2, #alter_search span[class*="icon-arrow"]').on('tap', 
      '#alter_search, #alter_search h2, #alter_search span[class*="icon-arrow"]', function(event){

      event.stopPropagation();

      // If the search form is not display, show it
      if($('#search #search_form').css('display') === 'none'){
         $('#search #search_form').slideDown();
         $('a#alter_search h2 span.search_arrow').removeClass('ui-icon-carat-d');
         $('a#alter_search h2 span.search_arrow').addClass('ui-icon-carat-u');
      }
      // Otherwise, hide the search form (but not submit)
      else if($('#results').css('display') != 'none') {
         $('#search #search_form').slideUp();
         $('a#alter_search h2 span.search_arrow').removeClass('ui-icon-carat-u');
         $('a#alter_search h2 span.search_arrow').addClass('ui-icon-carat-d');
      }
   });

   // When cancel is clicked on search page
   $(document).off('tap', '#alter_search span[class*="icon-cancel"]').on('tap', '#alter_search span[class*="icon-cancel"]', function(event){
      event.stopPropagation();

      if(changing){
         // Change page
         $.mobile.changePage("#myReservationPage");
      }
      else {
         $.mobile.changePage("#mapPage");
      }
   });

   // When the "Picture" button is clicked
   $(document).off('tap', '.picture').on('tap', '.picture', function(event){
      event.stopPropagation();
      event.preventDefault();

      showPicture($(this).attr('id').substring(2));
   });

   // When the "Map" button is clicked
   $(document).off('tap', '.map').on('tap', '.map', function(event){
      event.stopPropagation();
      event.preventDefault();
      var seat_id = $(this).attr('id');
      console.log(seat_id);
      showMap(seat_id.substring(2));
   });

   // When the "+"/reserve button is clicked
   $(document).off('tap', '.make_reservation').on('tap', '.make_reservation', function(event){
      event.stopPropagation();
      event.preventDefault();
      showConfirmation($(this).attr('id'));
   });

   // When the randomize button is clicked, choose a random seat and show confirmation window
   $(document).off('tap', '#randomize').on('tap', '#randomize', function(event){
      event.stopPropagation();
      event.preventDefault();

      var random = Math.floor(Math.random()*$('.make_reservation').size());

      // Get ID of seat and show confirmation window for that seat
      var seat_id = $('.make_reservation').eq(random).attr('id');
      showConfirmation(seat_id);
   });

   // When the user clicks off of the pop up
   $(document).off('tap', '.pop_up_haze').on('tap', '.pop_up_haze', function(event){
      event.preventDefault();
      event.stopPropagation();

      if($('.ui-panel-open').size() === 0 && $('div.ui-datebox-container').size() === 0){
         // Hide pop up, picture, and black haze
         $('#pop_up, #picture, div.pop_up_haze').hide();
         $('#pop_up div, #picture').remove();
         $('#makeReservationPage div#map.panzoom-parent').hide();
         $('#makeReservationPage div#map.panzoom-parent').remove();
      }
   });

   // When the user clicks on the pop up map
   $(document).off('tap', 'img#picture.map').on('tap', 'img#picture.map', function(event){
      event.preventDefault();
      event.stopPropagation();

      if($('.ui-panel-open').size() === 0 && $('div.ui-datebox-container').size() === 0){
         // Hide pop up, picture, and black haze
         $('#pop_up, #picture, div.pop_up_haze').hide();
         $('#pop_up div, #picture').remove();
         $('#makeReservationPage div#map.panzoom-parent').hide();
         $('#makeReservationPage div#map.panzoom-parent').remove();
      }
   });

   // Stop scrolling on pop up haze
   $(document).off('touchmove', '.pop_up_haze').on('touchmove', '.pop_up_haze', function(event){
      event.stopPropagation();
      event.preventDefault();
   });

   // When the "Confirm" is swiped
   $(document).off('swiperight', '#pop_up div.center').on('swiperight', '#pop_up div.center', function(event){
      event.stopPropagation();
      confirmAnimation();
   });

   // When start time is changed, update end time
   $(document).on('change', '#search_start_time', function(event){
      // Get current values from start and end time
      var start_time_DATE = $('#search_start_time').datebox('getTheDate');
      var end_time_DATE = $('#search_end_time').datebox('getTheDate');

      if(start_time_DATE >= end_time_DATE){
         // Update the end time
         $('#search #search_end_time').datebox('setTheDate', 
            new Date(start_time_DATE.getYear(), start_time_DATE.getMonth(), start_time_DATE.getDate(), 
                     start_time_DATE.getHours() + 1, end_time_DATE.getMinutes(), 0, 0)).trigger('datebox', {'method':'doset'});
      }
   });

   // When end_time is changed, update hour_diff
   $(document).on('change', '#search_end_time', function(event){
      // Get current values from start and end time
      var start_time_DATE = $('#search_start_time').datebox('getTheDate');
      var end_time_DATE = $('#search_end_time').datebox('getTheDate');

      // If new end time is less than start time, change start time to before end time
      if(start_time_DATE >= end_time_DATE) {
         $('#search #search_start_time').datebox('setTheDate', 
         new Date(start_time_DATE.getYear(), start_time_DATE.getMonth(), start_time_DATE.getDate(), 
                  end_time_DATE.getHours() - 1, end_time_DATE.getMinutes(), 0, 0)).trigger('datebox', {'method':'doset'});
      }
   });

   // Show haze when opening and hide haze when closing.
   $(document).on('datebox', '#search_date, #search_start_time, #search_end_time', function(event, passed){
      $('div.ui-datebox-container').addClass('date');

      if ( passed.method === 'close' ) {
         $('.pop_up_haze').hide();
      }
      else if( passed.method === 'open' ) {
         $('.pop_up_haze').show();
      }
   });

   // When the input box for the date picker is clicked, open the datebox
   $(document).off('tap', '#search_date, div#date span').on('tap', '#search_date, div#date span', function(event){
      event.stopPropagation();
      $('#search_date').datebox('open');
      $('.pop_up_haze').show();
   });

   // When the input box for the start time picker is clicked, open the datebox
   $(document).off('tap', '#search_start_time, div#time span:nth-of-type(1)').on('tap', '#search_start_time, div#time span:nth-of-type(1)', function(event){
      event.stopPropagation();
      $('#search_start_time').datebox('open');
      $('.pop_up_haze').show();
   });

   // When the input box for the end time picker is clicked, open the datebox
   $(document).off('tap', '#search_end_time, div#time span:nth-of-type(2)').on('tap', '#search_end_time, div#time span:nth-of-type(2)', function(event){
      event.stopPropagation();
      $('#search_end_time').datebox('open');
      $('.pop_up_haze').show();
   });

   // When a search option which is not selected is clicked, select it
   $(document).off('tap', '#more_options .search_option:not(.selected)').on('tap', '#more_options .search_option:not(.selected)', function(event){
      $(this).addClass('selected');
   });

   // When a search option which is selected is clicked, unselect it
   $(document).off('tap', '#more_options .selected').on('tap', '#more_options .selected', function(event){
      $(this).removeClass('selected');
   });

   // When "More Options" is clicked, show more options
   $(document).off('tap', '#show_more, #show_more span').on('tap', '#show_more, #show_more span', function(event){
      event.stopPropagation();
      event.preventDefault();
      showMoreOptions();
   });

   // When "Fewer Options" is clicked, show fewer options
   $(document).off('tap', '#show_less, #show_less span').on('tap', '#show_less, #show_less span', function(event){
      event.stopPropagation();
      event.preventDefault();
      hideMoreOptions();
   });

   // When the window is scrolled
   $(document).on('scroll', window, function(){
      // If scrolled past headings, show return to top button
       if ($(window).scrollTop() >= 300) {
           $('#makeReservationPage .return').show();
       }
       // Otherwise, hide it
       else if($(window).scrollTop() < 300) {
         $('#makeReservationPage .return').hide();
       }
   });

   // When return to top clicked, return the window to the top scrolled
   $(document).off('tap', '.return').on('tap', '.return', function(event){
      event.stopPropagation();
      event.preventDefault();
      $(window).scrollTop(0);
      $('.return').hide();
   });

   // When return to top button clicked, change color
   $(document).on('touchstart', '#return', function(){
      $('#return').css({'background-color' : '#29739A', 'color' : '#ccc'});
   });

   // Change return to top button color back
   $(document).on('touchend', '#return', function(){
      $('#return').css({'background-color' : '#067ab4', 'color' : '#fff'});
   });

   // Change color of search button or picture button when clicked
   $(document).on('touchstart', '#find_seat, .picture, button:not(.row_icon, #nav_button), div.ui-datebox-container a.ui-btn', function(event){
      $(this).css({'background' : '#29739A', 'color' : '#ddd'});
   });

   // Change color of search button back
   $(document).on('touchend', '#find_seat, .picture, button:not(.row_icon, #nav_button), div.ui-datebox-container a.ui-btn', function(event){
      $(this).css({'background' : '#3AA5DC', 'color' : 'white'})
   });

   // Change color of row icon when clicked
   $(document).on('touchstart', '.row_icon:not(.cancel)', function(event){
      $(this).css({'background' : '#6ebb1f'});
   });

   // Change color of row icon back
   $(document).on('touchend', '.row_icon:not(.cancel)', function(event){
      $(this).css({'background' : '#c4d82d'});
   });

   // Change color of confirm arrow when clicked
   $(document).on('touchstart', '#pop_up .ui-slider-track .ui-btn.ui-slider-handle', function(event){
      $(this).css({'background' : '#067ab4', 'color' : 'white'});
   });

   // Change color of confirm arrow back
   $(document).on('touchend', '#pop_up .ui-slider-track .ui-btn.ui-slider-handle', function(event){
      $(this).css({'background' : 'none', 'color' : '#067ab4'});
   });
});

// Before the page is shown, reset the values of hour_diff and changing, and clear and populate the search options
$(document).on('pagebeforeshow', '#makeReservationPage',function(){
   hour_diff = 1;
   changing = false;
   from_map = false;

   // Reset page
   clearMoreOptions();
   populateSearch();
   $('#search #search_form').show();
   $('#results').hide();
});

// Load reservation page and check if a reservation is being changed
function populateSearch() {
   // Get change_reservation JSON from local storage
   h_reservation = JSON.parse(localStorage.getItem("change_reservation_json"));
   current_seat = localStorage.getItem("seat_from_map");

   // Initialize date, start time, and end time variable
   var date;
   var start_time;
   var end_time;

   // If h_reservation is not null, a reservation is being changed
   if(h_reservation != null) {
      // Set "changing" to true
      changing = true;

      // Change icons of date and time pickers
      $('#time a[title="Open Date Picker"]').attr('class', 'ui-input-clear ui-btn ui-icon-clock ui-btn-icon-notext ui-shadow ui-corner-all');
      $('#date a[title="Open Date Picker"]').attr('class', 'ui-input-clear ui-btn ui-icon-calendar ui-btn-icon-notext ui-shadow ui-corner-all');

      // Set date, start time, and end time to converted values from h_reservation (reservatinon being changed)
      start_time = convertTimeToDate(h_reservation.start_time);
      end_time = convertTimeToDate(h_reservation.end_time);
      date = convertDateStringToDateObj(h_reservation.date);

      hideMoreOptions();
      $('#show_more').hide();

      // Change text of button
      $('#find_seat').html('Change Reservation');
      $('#alter_search').addClass('edit_heading');
      $('#alter_search h2').html('Edit Reservation '+
                                 '<span class="icon-pencil"></span>' +
                                 '<span class="icon-cancel-2"></span>' +
                                 '<span class="small_message">Your seat may be unavailbe at a new time.</span>');
   }
   // Otherwise, if the user was sent here from the map, reserve only the selected seat
   else if(current_seat != "null" && current_seat != null){
      from_map = true;

      // Set date, start time, and end time to today
      date = new Date();

      // Set start time to nearest half hour
      if(date.getMinutes() === 0){
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
      }
      else if(date.getMinutes() <= 30) {
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours(), 30, 0, 0);
      }
      else {
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0, 0, 0);  
      }
      // Set end time to 5:00 PM
      end_time = new Date(date.getYear(), date.getMonth(), date.getDate(), 17, 0, 0, 0);

      hideMoreOptions();
      $('#show_more').hide();

      // Change text of button
      $('#find_seat').html('Reserve Seat ' + current_seat);
      $('#alter_search').removeClass('edit_heading');
      $('#alter_search h2').html('Search Options '+
                                 '<span class="icon-cancel-2"></span>' +
                                 '<span class="small_message"></span>');      

   }
   // Otherwise, a new reservation is being made
   else {
      // Set date, start time, and end time to today
      date = new Date();

      // Set start time to nearest half hour
      if(date.getMinutes() === 0){
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
      }
      else if(date.getMinutes() <= 30) {
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours(), 30, 0, 0);
      }
      else {
         start_time = new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0, 0, 0);
         
      }

      // Set end time to 5:00 PM
      end_time = new Date(date.getYear(), date.getMonth(), date.getDate(), 17, 0, 0, 0);

      $('#show_more').show();

      // Change text of button
      $('#find_seat').html('Reserve a Seat');
      $('#alter_search').removeClass('edit_heading');
      $('#alter_search h2').html('Search Options '+
                                 '<span class="small_message"></span>');
   }

   createDT(date, start_time, end_time);

   // Set change_reservation to null in local storage
   localStorage.setItem("change_reservation_json", null);
   localStorage.setItem("seat_from_map", "null");
}

// Set symbols for date, start time, and end time and populates them
function createDT(date, start_time, end_time) {
   $('#time a[title="Open Date Picker"]').attr('class', 'ui-input-clear ui-btn ui-icon-clock ui-btn-icon-notext ui-shadow ui-corner-all');
   $('#date a[title="Open Date Picker"]').attr('class', 'ui-input-clear ui-btn ui-icon-calendar ui-btn-icon-notext ui-shadow ui-corner-all');

   // Populate start and end time
   $('#search #search_date').datebox('setTheDate', date).trigger('datebox', {'method':'doset'});
   $('#search #search_start_time').datebox('setTheDate', start_time).trigger('datebox', {'method':'doset'});
   $('#search #search_end_time').datebox('setTheDate', end_time).trigger('datebox', {'method':'doset'});
}

// Retract more search options and change test/id of show/hide title
function hideMoreOptions(){
   // Hide more search options
   $('#search #more_options').slideUp();

   // If a search option (icon or type) has been selected, change title of show/hide with star
   if($('.selected').size() > 0 || 
         $('div.ui-checkbox label.ui-checkbox-on').size() > 0 ||
         $('#search_seat_number').val() != ""){
      $('#search #show_less span:not(.ui-icon)').html("More Options*");
   }
   // Otherwise, change without star
   else {
      $('#search #show_less span:not(.ui-icon)').html("More Options");
   }

   // Change direction of arrow
   $('#search #show_less span.ui-icon').attr('class', 'ui-icon ui-icon-carat-d ui-btn-icon-notext ui-btn-icon-right ui-icon-transparent');

   // Change id of show/hide title
   $('#show_less').attr('id', 'show_more');
}

// Show more search options and change test/id of show/hide title
function showMoreOptions(){
   // Show more search options
   $('#search #more_options').slideDown();

   // Change title and id of show/hide title
   $('#search #show_more span:not(.ui-icon)').html("Fewer Options");
   $('#search #show_more span.ui-icon').attr('class', 'ui-icon ui-icon-carat-u ui-btn-icon-notext ui-btn-icon-right ui-icon-transparent');
   $('#show_more').attr('id', 'show_less');
}

// Clears and hide more options for when page is loaded
function clearMoreOptions(){
   // Remove all selections
   $('.selected').removeClass('selected');
   $('input[type="checkbox"]').prop('checked', false).checkboxradio('refresh');
   $('#search_seat_number').val('');
   $('#select_seat_number').val('with');
   $('#select_seat_number').selectmenu( "refresh", true );

   if($('#show_less').size() > 0){
      hideMoreOptions();
   }
   else {
      $('#search #show_more span:not(.ui-icon)').html("More Options");
   }
}

// Filter results from results JSON based on search criteria and display results in a FooTable
function getResults(){
   var allRows = '';
   var count = 0;

   // Get date, start time, and end time from dateboxes and convert format
   var date = convertDateObjToDateString($('#search #search_date').datebox('getTheDate'));
   var start_time = convertDateToTime($('#search #search_start_time').datebox('getTheDate'));
   var end_time = convertDateToTime($('#search #search_end_time').datebox('getTheDate'));

   // Get reservations, seats, and types JSON from local storage
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   var seats = JSON.parse(localStorage.getItem("seats_json"));
   var types = JSON.parse(localStorage.getItem("types_json"));
   var user_id = localStorage.getItem("user_id");

   // Seat variable to lists inside JSONs
   seats = seats.seats;
   reservations = reservations.reservations;
   types = types.types;

   // Initialize variables
   var reserved_seats = [];
   var seat_type = "";
   var seat_details = "";
   var type_id = "";

   // Loop through reservations and add taken seats to reserved_seats
   for(var i = 0; i < reservations.length; i++){
      // If the date matches and the time's overlap, add the seat to reserved_seats
      if(reservations[i].date === date && 
         ((reservations[i].end_time < end_time && reservations[i].end_time > start_time) || 
         (reservations[i].start_time > start_time && reservations[i].start_time < end_time) ||
         (reservations[i].start_time <= start_time && reservations[i].end_time >= end_time) ||
         (reservations[i].start_time === start_time && reservations[i].end_time === end_time))){

         if(reservations[i].user_id === user_id) {
            alert("You already have a reservation at this time.");
            return;
         }

         reserved_seats.push(reservations[i].seat_id);
      }
   }

   clearResults();

   // Initialize all search requirements to "true" (the results is not REQUIRED to have it)
   var seat_requirements = {"monitor" : true, "keyboard" : true, "mouse" : true, "drawers" : true};

   // Get all search options
   var search_options = $('#more_options .search_option');

   // Loop through search options and adjust values of requirements
   for(var i = 0; i < search_options.size(); i++){
      // If this option is selected, change the value
      if(search_options.eq(i).hasClass('selected')){
         // Series of if/else statements to change appropriate requirement
         if(search_options.eq(i).attr('id') === "monitor") {
            seat_requirements.monitor = false;
         }
         else if(search_options.eq(i).attr('id') === "keyboard") {
            seat_requirements.keyboard = false;
         }
         else if(search_options.eq(i).attr('id') === "mouse") {
            seat_requirements.mouse = false;
         }
         else if(search_options.eq(i).attr('id') === "drawers") {
            seat_requirements.drawers = false;
         }
      }
   }

   // Initialize empty list for selected types
   var types_list = [];

   // Get all selected types from user input
   var chosen_types = $('div.ui-checkbox label.ui-checkbox-on');

   // Loop through the chosen types and add the type_id (for attribute) to types_list
   for(var i = 0; i < chosen_types.size(); i++) {
      types_list.push(chosen_types.eq(i).attr('for'));
   }

   var chosen_seat_selector = $('#select_seat_number').val();
   var chosen_seat_number = $('#search_seat_number').val().toUpperCase();

   // Loop through seats to retrieve seat information for all results
   for(var i = 0; i < seats.length; i++){
      // Reset seat_details
      seat_details = "";

      var seat_number_matches = true;

      // Set seat_number matches to false if the search criteria for seat number does not match
      if(chosen_seat_number != ""){
         // If the user chose "exactly" and the seat number does not match exactly
         if(chosen_seat_selector === "equal" && chosen_seat_number != seats[i].seat_id){
            seat_number_matches = false;
         }
         // If the user chose "containing" and the seat number does not contain it
         else if(chosen_seat_selector === "with" && seats[i].seat_id.indexOf(chosen_seat_number) < 0){
            seat_number_matches = false;
         }
         // If the user chose "not containing" and the seat number is contained
         else if(chosen_seat_selector === "not" && seats[i].seat_id.indexOf(chosen_seat_number) >= 0){
            seat_number_matches = false;
         }
      }

      // If the seat complies to all search criteria, get seat information and add to allRows
      if(seats[i].available && seat_number_matches &&
         (chosen_types.size() === 0 || $.inArray(seats[i].type_id, types_list) > -1) &&
         (seat_requirements.monitor || seats[i].monitor) &&
         (seat_requirements.keyboard || seats[i].keyboard) &&
         (seat_requirements.mouse || seats[i].mouse) &&
         (seat_requirements.drawers || seats[i].drawers > 0) &&
         $.inArray(seats[i].seat_id, reserved_seats) < 0) {

         count++;
         
         // Loop through types JSON to get type for certain seat
         for(var j = 0; j < types.length; j++){
            if(seats[i].type_id === types[j].type_id){
               seat_type = types[j].type;
               
               break;
            }
         }

         // Get seat details
         // Monitor
         if(seats[i].monitor){
            seat_details += '<i class="icon-monitor detail"></i>';
         }
         else {
            seat_details += '<i class="icon-monitor detail">' +
                           '<i class="icon-blocked no_detail"></i>' +
                        '</i>';
         }

         // Keyboard
         if(seats[i].keyboard){
            seat_details += '<i class="icon-keyboard detail"></i>';
         }
         else {
            seat_details += '<i class="icon-keyboard detail">' +
                           '<i class="icon-blocked no_detail"></i>' +
                        '</i>';
         }

         // Mouse
         if(seats[i].mouse){
            seat_details += '<i class="icon-mouse detail"></i>';
         }
         else {
            seat_details += '<i class="icon-mouse detail">' +
                           '<i class="icon-blocked no_detail"></i>' +
                        '</i>';
         }

         // Drawers
         if(seats[i].drawers > 0){
            seat_details += '<i class="icon-cabinet detail"></i>';
         }
         else {
            seat_details += '<i class="icon-cabinet detail">' +
                           '<i class="icon-blocked no_detail"></i>' +
                        '</i>';
         }

         // Get seat rating
         var rating = '<div class="star_holder" id="star_' + seats[i].seat_id + '">' + 
                     getRating(seats[i].seat_id) + 
                  '</div>';

         var rating_number = getRatingNumber(seats[i].seat_id);

         // Write new row in FooTable and add to allRows
         allRows += '<tr id="seat_' + seats[i].seat_id + '">' +
                     '<td>' + seat_type + '</td>' +
                     '<td># ' + seats[i].seat_id + '</td>' +
                     '<td>' +
                        '<span class="rating_number">' + rating_number + '</span>' +
                        '<a class="row_icon_holder">' +
                           '<button class="make_reservation row_icon" id="' + seats[i].seat_id + '">' +
                              '<span class="ui-icon ui-icon-plus ui-btn-icon-notext ui-icon-transparent"></span>' +
                           '</button>' +
                        '</a>' +
                     '</td>' +
                     '<td>' + 
                        seat_details + rating + 
                        '<button class="more_details picture picture_map_button" id="p_' + seats[i].seat_id + '">Picture</button>' +
                        '<button class="more_details map picture_map_button" id="m_' + seats[i].seat_id + '">Map View</button>' +
                     '</td>' +
                  '</tr>';
      }
   }

   // Write code for FooTable, including allRows in tbody
   var newTable = '<table class="footable toggle-arrow" id="results_table">' +
                  '<thead>' +
                     '<tr>' +
                        '<th data-class="expand">Type</th>' +
                        '<th>Seat</th>' +
                        '<th data-sort-initial="descending" data-type="numeric">Rating</th>' +
                        '<th data-hide="phone,tablet"></th>' +
                     '</tr>' +
                  '</thead>' +
                  '<tbody id="results_body">' +
                     allRows +
                  '</tbody>' +
               '</table>';
   
   // Hide search form
   $('#search #search_form').slideUp();
   $('a#alter_search h2').append('<span class="search_arrow ui-icon ui-icon-carat-d ui-btn-icon-notext ui-btn-icon-right ui-icon-transparent"></span>');

   // If results were found, append the FooTable to results and run footable()
   if(allRows !== ''){
      $('#results h2').html('Results (' + count + ')');
      $('#randomize').show();
      $('#results').show();
      $('#results').append(newTable);
      $('#results_table').footable();
   } 
   // Otherwise, display an error message
   else{
      $('#results h2').html('Results');
      $('#randomize').hide();
      $('#results').show();
      $('#results .error').html("No results for this search.");
   }
}

// Clears the results section of the makeReservation page
function clearResults(){
   // Clear tables and error message
   $('#makeReservationPage table').remove();
   $('#results .error').html("");
}

// Show confirmation window for a seat and save reservation info in reservation
function showConfirmation(seat_id){
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
                     '<div class="center">' +
                        '<span class="confirm_arrow icon-arrow-right-5"></span>' +
                        '<span class="swipe_to_confirm">Swipe to Confirm</span>' +
                        '<span class="confirmed">Confirmed!</span>' +
                     '</div>';

   // Append pop up information to the pop up and run slider() on the confirmation slider
   $('#pop_up').append(pop_up_info);

   // Get seats, reservations, and types JSONs
   var seats = JSON.parse(localStorage.getItem("seats_json"));
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   var types = JSON.parse(localStorage.getItem("types_json"));

   // Set variables to lists inside JSONs
   seats = seats.seats;
   reservations = reservations.reservations;
   types = types.types;

   // Get user_id from local storage
   var user_id = localStorage.getItem("user_id");

   // Set reserve_id for new reservation by incrementing last reservation's id
   var reserve_id = 1;
   if(reservations.length != 0){
      reserve_id = Number(reservations[reservations.length-1].reserve_id) + 1;
   }

   // Seat values in reservation
   reservation.seat_id = seat_id;
   reservation.user_id = user_id;
   reservation.reserve_id = reserve_id;

   // Loop through seats to get type of selected seat
   for(var i = 0; i < seats.length; i++){
      // If seat_id matches
      if(seats[i].seat_id === seat_id){
         // Loop through types to get type of selected seat
         for(var j = 0; j < types.length; j++){
            // If type_id matches, add the type to the HTML of the pop up title
            if(seats[i].type_id === types[j].type_id){
               var seat_info = types[j].type + " " + seats[i].seat_id;
               $('#pop_up h2').html(seat_info);
            }
         }
      }
   }

   // Get Date of date input and convert to date format, then add to HTML
   var date = convertDateObjToDateString($('#search_date').datebox('getTheDate'));
   reservation.date = date;
   date = convertDate(date);
   $('#pop_up #confirm_date').html(date);

   // Get Date of start time input and convert to time, then add to HTML
   var start_time = convertDateToTime($('#search_start_time').datebox('getTheDate'));
   reservation.start_time = start_time;
   start_time = convertTime(start_time);

   // Get Date of end time and convert to time, then add to HTML
   var end_time = convertDateToTime($('#search_end_time').datebox('getTheDate'));
   reservation.end_time = end_time;
   end_time = convertTime(end_time);
   $('#pop_up #confirm_time').html(start_time + " to " + end_time);

   // Show black haze and pop up window
   $('div.pop_up_haze').show();
   $('#pop_up').show();
}

// Animate the confirmation swipe
function confirmAnimation() {
   // Animate swip arrow to the right
    $( '#pop_up span.confirm_arrow' ).animate(
      {
         left: "+=230"
      }, 
      { duration: 1000, queue: false }
   );

    // Animate "Swipe to Confirm" message to the right
   $('#pop_up span.swipe_to_confirm').animate(
      {
            marginLeft: '150px'
      }, 
      { 
         duration: 800, 
         queue: false,
         complete: function(){
            $('.swipe_to_confirm').hide();
         }
      }
    );

   // Animate "Confirmed!" message to the right
    $('#pop_up span.confirmed').animate(
      {
            marginLeft: '-65px'
      },
      {
         duration: 1000, 
         queue: false,
         complete: function()
         {
            setTimeout(function() {
               // Confirm reservation and hide pop-up window
               $('#pop_up').hide();
               $('div.pop_up_haze').hide();
               $('#pop_up div').remove();
              }, 300);
            
         }
      }
    );

    confirmReservation();
}

// Add reservation to local storage
function confirmReservation() {
   // Add reservation to reservations list and store
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   reservations.reservations.push(reservation);
   localStorage.setItem("reservation_json", JSON.stringify(reservations));

   clearResults();
   clearMoreOptions();
   $('#search #search_form').slideDown();
   $('#alter_search h2').html('Search Options '+
                                 '<span class="small_message"></span>');  
   $('#results').hide();
   $('#alter_search span[class*="icon-arrow"]').remove();
   updateResNotify();
}

// Edit a reservation, replacing old reservation if a change was made
function editReservation() {
   // Get date, start time, and end time from dateboxes and convert format
   var date = convertDateObjToDateString($('#search #search_date').datebox('getTheDate'));
   var start_time = convertDateToTime($('#search #search_start_time').datebox('getTheDate'));
   var end_time = convertDateToTime($('#search #search_end_time').datebox('getTheDate'));
   
   // Get reservations, seats, and types JSON from local storage
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));

   // Set reserve_id for new reservation by incrementing last reservation's id
   var reserve_id = 1;
   if(reservations.reservations.length != 0){
      reserve_id = Number(reservations.reservations[reservations.reservations.length-1].reserve_id) + 1;
   }

   var isAvailable = seatAvailable(h_reservation.seat_id, date, start_time, end_time);

   if(isAvailable === -1 || isAvailable === h_reservation.reserve_id){
      deleteReservation(h_reservation.reserve_id);

      reservation = { "reserve_id" : reserve_id, 
                        "seat_id" : h_reservation.seat_id, 
                        "user_id" : h_reservation.user_id, 
                        "date" : date, 
                        "start_time" : start_time, 
                        "end_time" : end_time };

      confirmReservation();

      alert("Reservation changed.");
      // Change page
      $.mobile.changePage("#myReservationPage");
   }
   else {
      alert("Your seat is not available at this time!");
   }
}

// Reserve a seat when the user was sent from the map
function reserveFromMap(){
   // Get date, start time, and end time from dateboxes and convert format
   var date = convertDateObjToDateString($('#search #search_date').datebox('getTheDate'));
   var start_time = convertDateToTime($('#search #search_start_time').datebox('getTheDate'));
   var end_time = convertDateToTime($('#search #search_end_time').datebox('getTheDate'));

   // Get reservations, seats, and types JSON from local storage
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));

   // Set reserve_id for new reservation by incrementing last reservation's id
   var reserve_id = 1;
   if(reservations.reservations.length != 0){
      reserve_id = Number(reservations.reservations[reservations.reservations.length-1].reserve_id) + 1;
   }

   // Get user_id from local storage
   var user_id = localStorage.getItem("user_id");

   var isAvailable = seatAvailable(current_seat, date, start_time, end_time, user_id);

   if(isAvailable === -1) {
      // Set reservation
      reservation = { "reserve_id" : reserve_id, 
                        "seat_id" : current_seat, 
                        "user_id" : user_id, 
                        "date" : date, 
                        "start_time" : start_time, 
                        "end_time" : end_time };

      confirmReservation();

      alert("Seat reserved!");
      // Change page
      $.mobile.changePage("#mapPage");
   }
   else if(isAvailable === -2){
      alert("You already have a reservation at this time.");
   }
   else {
      alert("This seat is not available at that time!");
   }
}

// Checks if given seat number is available for the parameterized date, start_time, and end_time
// Return -1 if available, otherwise the reserve_id of the conflicting reservation
function seatAvailable(seat_id, date, start_time, end_time, user_id){
   // Get reservations, seats, and types JSON from local storage
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   reservations = reservations.reservations;

   // Loop through reservations and add taken seats to reserved_seats
   for(var i = 0; i < reservations.length; i++){
      // If the date matches and the time's overlap, add the seat to reserved_seats
      if(reservations[i].date === date && 
         ((reservations[i].end_time < end_time && reservations[i].end_time > start_time) || 
         (reservations[i].start_time > start_time && reservations[i].start_time < end_time) ||
         (reservations[i].start_time <= start_time && reservations[i].end_time >= end_time) ||
         (reservations[i].start_time === start_time && reservations[i].end_time === end_time))){

         // If you already have a reservation at this time, return -2
         if(reservations[i].user_id === user_id){
            return -2;
         }
         // Otherwise, if the seat is the same, return the reserve_id 
         else if(reservations[i].seat_id === seat_id) {
            return reservations[i].reserve_id;
         }
      }
   }
   
   return -1;
}
