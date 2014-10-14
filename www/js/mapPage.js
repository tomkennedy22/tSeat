// When the map page is initialized
$(document).on('pageinit', '#mapPage', function(){
	// When the reserve button is clicked, allows user to reserve that seat
	$(document).off('tap', '#reserve_from_map').on('tap', '#reserve_from_map', function(event){
		var current_seat = $('#map_seat_number').val().toUpperCase(); 

		// If the seat exists, take user to reserve it
		if(seatExists(current_seat)){
			localStorage.setItem('seat_from_map', current_seat);
			$.mobile.changePage("#makeReservationPage");
		}
		else {
			alert("That seat number is not available.");
		}
	});
});

// Before the map page is shown, change the seat number to A1
$(document).on('pagebeforeshow', '#mapPage', function(){
	$('#map_seat_number').val('A1');

	// Set map to default zoomed out
   var $section = $('#inverted-contain');
	$section.find('.panzoom').panzoom("resetZoom");
	$section.find('.panzoom').panzoom("resetPan");
});

(function() {
	var $section = $('#inverted-contain');
	$section.find('.panzoom').panzoom({
//			$zoomIn: $section.find(".zoom-in"),
//			$zoomOut: $section.find(".zoom-out"),
		$zoomRange: $section.find(".zoom-range"),
		$reset: $section.find(".reset"),
		startTransform: 'scale(1)',
		increment: 0.5,
		minScale: 1.0,
		contain: 'invert'
	}).panzoom('zoom');
})();

// Takes parameterized seat_id and returns true if the seat exists, false otherwise
function seatExists(seat_id) {
	var seats = JSON.parse(localStorage.getItem("seats_json"));
   seats = seats.seats;

   // Loop through seats and return true if seat found
   for(var i = 0; i < seats.length; i++){
      if(seats[i].seat_id === seat_id){
            return true;
      }
   }

   return false;
}