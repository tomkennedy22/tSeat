document.onload = function(){
	localStorage.clear();

	// Load users data from JSON into local storage
	loadJSON();
};

$(document).ready(function(){
	//loadJSON();
	loadJSON();

	setTimeout(clearOldReservations(),1500);
	localStorage.setItem("seat_from_map", "null");
});

// When the login page is initialized
$(document).on('pageinit', '#loginPage', function(event){
	// Change color of submit button when clicked
	$(document).on('touchstart', 'button:not(#nav_button)', function(event){
		$(this).css({'background' : '#29739A', 'color' : '#ddd'});
	});

	// Change color of submit button back
	$(document).on('touchend', 'button:not(#nav_button)', function(event){
		$(this).css({'background' : '#3AA5DC', 'color' : 'white'})
	});
	
	$(document).on('tap', '#loginPage button', function(event){
		click_submit();
	});
});

// Before the page is shown, clear username and password
$(document).on('pagebeforeshow', '#loginPage', function(){
	$('#username').val("");
	$('#password').val("");
});

// Function for the submit button on the login page
function click_submit(){
	// Get information on all users from local storage
	var user = JSON.parse(localStorage.getItem("user_json"));

	// Get username and password inputted by user
	var username = document.getElementById("username").value.toLowerCase();
	var password = document.getElementById("password").value;
	
	// Format username for ease when checking
	// User can enter id as either attuid or attuid@att.com
	if(username.indexOf('@att.com') == -1){
		username += '@att.com';
	}
	
	var userfound = false;

	$('img#map.panzoom').panzoom("resetZoom");

	// Loop through all users
	for (var i = 0; i < user.users.length; i++) {
		// If the username matches, check password
		if(user.users[i].username.toLowerCase() == username){
			// If the password matches, login and navigate to makeReservation
			if (user.users[i].password == password){
				userfound = true;
				localStorage.setItem("user_id", user.users[i].user_id);
				$.mobile.changePage("#makeReservationPage",{transition:'pop'});
			}
			// Otherwise, display an error message
			else{
				alert("Username and/or password incorrect.");
				userfound = true;
			}
			break;
		}
	}

	// If the inputted username did not exist in users, display error message
	if(!userfound) {
		alert("Username and/or password incorrect.");
	}
}

// Save local storage back to JSON files when user logs out
function logout(){

	document.getElementById("username").value = "";
	document.getElementById("password").value = "";

	$.post("../www/json/user.json", localStorage.getItem("user_json"), function(noData) {});

	$.post("../www/json/reservations.json", localStorage.getItem("reservation_json"), function(noData) {});

	$.post("../www/json/seats.json", localStorage.getItem("seats_json"), function(noData) {});

	$.post("../www/json/types.json", localStorage.getItem("types_json"), function(noData) {});

	$.post("../www/json/ratings.json", localStorage.getItem("ratings_json"), function(noData) {});

	localStorage.clear();
}



// Convert parameter date from date string (yyyy-mm-dd) to date object
function convertDateStringToDateObj(date) {
    var year = parseInt(date.substring(0,4), 10);
    var month = parseInt(date.substring(5,7), 10) - 1;
    var day = parseInt(date.substring(8,10), 10);

    return new Date(year, month, day, 0, 0, 0, 0);
}

// Get rid of reservations that happen before today
function clearOldReservations(){

	var reservations = JSON.parse(localStorage.getItem("reservation_json"));

	for (var j = 0; j < reservations.reservations.length; j++) {
		var resDate = convertDateStringToDateObj(reservations.reservations[j].date);
		var today = new Date();
		if (today>resDate) {
			delete reservations.reservations[j];
		}
	}

	localStorage.setItem("reservation_json", JSON.stringify(reservations));
}

// Load the JSON files into local storage
function loadJSON(){
	$.getJSON('../www/json/user.json', function(data){
		 users = data;
		 localStorage.setItem("user_json", JSON.stringify(users));
	});

	// Load reservations from JSON into local storage
	$.getJSON('../www/json/reservations.json', function(data){
		var reservations = data;
		localStorage.setItem("reservation_json", JSON.stringify(reservations));
	});

	// Load seats information from JSON into local storage
	$.getJSON('../www/json/seats.json', function(data){
		var seats = data;
		localStorage.setItem("seats_json", JSON.stringify(seats));
	});

	// Load types information from JSON into local storage
	$.getJSON('../www/json/types.JSON', function(data){
		var types = data;
		localStorage.setItem("types_json", JSON.stringify(types));
	});

	// Load ratings from JSON into local storage
	$.getJSON('../www/json/ratings.json', function(data){
		var ratings = data;
		localStorage.setItem("ratings_json", JSON.stringify(ratings));
	});
}
