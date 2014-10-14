// Set listeners when the page is initialized
$(document).on('pageinit', '#myReservationPage', function(){
   // When the edit button is clicked, save that reservation (to be changed) and navigate to makeReservation
   $(document).off('tap', '.edit').on('tap', '.edit', function(event){
      event.stopPropagation();
      event.preventDefault();

      saveReservation($(this).attr('id'));
      $.mobile.changePage("#makeReservationPage");
   });

   // When the cancel button is clicked, cancel that reservation and reload reservations
   $(document).off('tap', '.cancel').on('tap', '.cancel', function(event){
      event.stopPropagation();
      event.preventDefault();

      deleteReservation($(this).attr('id'));
      loadReservations(true);
      updateResNotify();
   });

   // When a row in the FooTable is swiped left, reveal cancel
   $(document).on('swipeleft', 'tr.relative', function(event){
      event.stopPropagation();

      // Get index of swiped row
      var index = $(this).index('tr.relative');
      showCancelButton(index);
   });

   // When a row in the FooTable is swiped right, hide cancel
   $(document).on('swiperight', 'tr.relative', function(event){
      event.stopPropagation();

      // Get index of swiped row
      var index = $(this).index('tr.relative');
      hideCancelButton(index);
   });

   // Change color of cancel when clicked
   $(document).on('touchstart', '.cancel, span[class*="icon-cancel"]', function(event){
      $(this).css('background', '#da3872');
   });

   // Change color of cancel back
   $(document).on('touchend', '.cancel', function(event){
      $(this).css('background', '#b30a3c');
   });

   // When the window is scrolled
   $(document).on('scroll', window, function(){
      // If scrolled past headings, show return to top button
       if ($(window).scrollTop() >= 100) {
           $('#myReservationPage .return').show();
       }
       // Otherwise, hide it
       else if($(window).scrollTop() < 100) {
         $('#myReservationPage .return').hide();
       }
   });
});

// Hide error messages and content before page is shown
$(document).on('pagebeforeshow','#myReservationPage', function(){
   $('.error').html("");
   $('div#content').css('opacity', '0');
});

// Load reservations when page is shown
$(document).on('pageshow','#myReservationPage', function(){
   loadReservations(false);
});

//Save the reservation with paramenterized reserve_id in local storage
function saveReservation(reserve_id) {
   // Get reservations JSON from local storage and set variable to list within
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   reservations = reservations.reservations;

   // Loop through reservations
   for(var i = 0; i < reservations.length; i++) {
      // If reserve_id matches, save that reservation in local storage
      if(Number(reservations[i].reserve_id) === Number(reserve_id)) {
         localStorage.setItem("change_reservation_json", JSON.stringify(reservations[i]));
         break;
      }
   }
}

// Loads all the users reservations into a FooTable and displays them
function loadReservations() {
   $('#myReservationPage table').remove();

   // Get information from JSONs in local storage
   var user_id = localStorage.getItem("user_id");
   var reservations = JSON.parse(localStorage.getItem("reservation_json"));
   var seats = JSON.parse(localStorage.getItem("seats_json"));
   var types = JSON.parse(localStorage.getItem("types_json"));

   seats = seats.seats;
   types = types.types;

   var user_res = 0;
   var reses = "";

   // Loop through reservations and add the reservations to the FooTable if current user's
   for (var i = reservations.reservations.length - 1; i >= 0; i--) {
      // If this reservation belongs to current user
      if (reservations.reservations[i].user_id == user_id){
         var seat_details = "";
         var seat_type = "";
         var type_id = "";

         // Get seat details
         for(var j = 0; j < seats.length; j++){
            if(seats[j].seat_id === reservations.reservations[i].seat_id){

               type_id = seats[j].type_id;

               // Get seat type
               for(var k = 0; k < types.length; k++){
                  if(types[k].type_id === seats[j].type_id){
                     seat_type = types[k].type;
                     break;
                  }
               }

               // Get seat details
               // Monitor
               if(seats[j].monitor){
                  seat_details += '<i class="icon-monitor detail"></i>';
               }
               else {
                  seat_details += '<i class="icon-monitor detail">' +
                                 '<i class="icon-blocked no_detail"></i>' +
                              '</i>';
               }

               // Keyboard
               if(seats[j].keyboard){
                  seat_details += '<i class="icon-keyboard detail"></i>';
               }
               else {
                  seat_details += '<i class="icon-keyboard detail">' +
                                 '<i class="icon-blocked no_detail"></i>' +
                              '</i>';
               }

               // Mouse
               if(seats[j].mouse){
                  seat_details += '<i class="icon-mouse detail"></i>';
               }
               else {
                  seat_details += '<i class="icon-mouse detail">' +
                                 '<i class="icon-blocked no_detail"></i>' +
                              '</i>';
               }

               // Drawers
               if(seats[j].drawers > 0){
                  seat_details += '<i class="icon-cabinet detail"></i>';
               }
               else {
                  seat_details += '<i class="icon-cabinet detail">' +
                                 '<i class="icon-blocked no_detail"></i>' +
                              '</i>';
               }

               break;
            }
         }

         user_res++;

         // Get seat rating
         var rating = '<div class="star_holder" id="star_' + reservations.reservations[i].seat_id + '">' + 
                        getRating(reservations.reservations[i].seat_id) + 
                     '</div>';

         // Get date number for sorting FooTable
         var date = convertDateStringToDateObj(reservations.reservations[i].date);
         var date_ticks = (date * 10000) + 621355968000000000;

         // Write row entry for this reservation and add it to reses
         reses += '<tr class="relative">'+
                  '<td>' + seat_type + '</td>' +
                  '<td># ' + reservations.reservations[i].seat_id + '</td>' +
                  '<td class="relative" data-value="' + date_ticks + '" width="115px">' + convertDate(reservations.reservations[i].date) +
                     '<a class="row_icon_holder">' +
                        '<button type="button" class="row_icon edit" id="' + reservations.reservations[i].reserve_id + '">' +
                              '<span class="icon-pencil"></span>' +
                        '</button>' +
                     '</a>' +
                     '<button type="button" class="row_icon cancel" id="' + reservations.reservations[i].reserve_id + '">' +
                           '<span>Delete</span>' +
                     '</button>' +
                  '</td>' +
                  '<td>' + 
                     '<span class="mini_title strong">' +
                        convertTime(reservations.reservations[i].start_time) + ' - ' + 
                        convertTime(reservations.reservations[i].end_time) + 
                     '</span>' +
                  '</td>' +
                  '<td>' + 
                     seat_details + rating +
                     '<button class="more_details picture picture_map_button" id="m_' + reservations.reservations[i].seat_id + '">Picture</button>' +
                     '<button class="more_details map picture_map_button" id="p_' + reservations.reservations[i].seat_id + '">Map View</button>' +
                  '</td>' +
               '</tr>';
      }
   }

   // If the user has reservations, add the FooTable with these reservations
   if(user_res > 0) {
      var table = "<table id='resTable' class='footable toggle-arrow'>" +
                  "<thead><tr>"+
                     "<th data-class='expand' width='106'>Type</th>"+
                     "<th width='62'>Seat</th>" +
                     "<th data-type='numeric' data-sort-initial='true'>Date</th>"+
                     "<th data-hide='phone,tablet'></th>"+
                     "<th data-hide='phone,tablet'></th>"+
                  "</tr></thead>" +
                  "<tbody>" +
                     reses +
                  "</tbody>" +
               "</table>";

      // Append table, run footable(), and fade in section
      $("#content").append(table);
      $('#resTable').footable();
      $('#myReservationPage .small_message').html("Swipe Row Left to Delete");
      $('div#content').animate(
         {
            opacity: "1"
         },
         250
      );
   }
   // Otherwise, present an error message
   else {
      $('.error').html("You have not made any reservations.");
      $('#myReservationPage .small_message').html("");
      $('div#content').css('opacity', '1');
   }
}

// Takes a parameter index and shows the cancel button for the row at that index
function showCancelButton(index){
   var cancel_buttons = $('.cancel');

   // Hide any cancel buttons that are already shown
   for(var i = 0; i < cancel_buttons.size(); i++){
      if(cancel_buttons.eq(i).css('display') != "none" && i != index){
         hideCancelButton(i);
      }
   }

   // If cancel is not already displayed
   if($('.cancel').eq(index).css('display') === "none"){
      // Set the cancel to have no width
      $('.cancel').eq(index).css('width', '0px');
      $('.cancel').eq(index).show();

      // Grow the width of cancel with an animation
      $('.cancel').eq(index).animate({
         width: "118px",
      }, 300 );
   }
}

// Takes a parameter index and hides the cancel button for the row at that index
function hideCancelButton(index){
   // Animatedly shrink and hide cancel
   $('.cancel').eq(index).animate({
      width: "0px",
   }, 300, function(){
      $('.cancel').eq(index).hide();
   });
}