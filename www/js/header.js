var index = 0;

// Code for the navigation panel
var panel = '<div data-role="panel" id="nav_panel" data-position="right" data-display="overlay">'+
               '<div class="nav_page">Reserve<span class="icon-calendar"></span></div>'+
               '<div class="nav_page">My Seats<span class="icon-book"></span><span class="notify"></span></div>'+
               '<div class="nav_page">Floor Map<span class="icon-location"></span></div>'+
               '<div class="nav_page">About Us<span class="icon-info"></span></div>'+
               '<div class="nav_page">Log Out<span class="icon-exit"></span></div>'+
            '</div>';

//Object holding the pages on our application
var pages = [{ "page" : [ "#makeReservationPage", "Reserve", "icon-calendar" ]}, 
             { "page" : [ "#myReservationPage", "My Seats", "icon-book" ]},
             { "page" : [ "#mapPage", "Floor Map", "icon-location" ]},
             { "page" : [ "#aboutPage", "About Us", "icon-info" ]},
             { "page" : [ "#loginPage", "Log Out", "icon-exit"]}];

// Before a page is created, attached panel
$(document).on('pagebeforecreate', function () {
   $.mobile.pageContainer.prepend(panel);
   $("#nav_panel").panel();
});

// When a page is created
$(document).on('pagecreate', function(){
   // Create the footer
   $('[data-role="footer"]').load("footer.html").trigger('create');

   // When a star is clicked, make a rating
   $(document).off('tap', 'i[class*="icon-star"]').on('tap', 'i[class*="icon-star"]', function(event){
      var seat_id = $(this).attr('value');
      var rating = Number($(this).attr('count')) + 1;

      // Make rating
      makeRating(seat_id, rating);

      // Remove old stars, and update new ones
      $('div[id="star_' + seat_id + '"] i[class*="icon-star"]').remove();
      $('div[id="star_' + seat_id + '"]').append(getRating(seat_id));

      // Update rating number in column of FooTable on makeReservation page
      if($.mobile.activePage.is("#makeReservationPage")){
         updateRatingNumber(seat_id, getRatingNumber(seat_id));
      }
   });

   // When the footer or body is swiped left, change pages
   $(document).off('swipeleft', 'div[data-role="footer"], body').on('swipeleft', 'div[data-role="footer"], body', function(event){
      event.stopPropagation();

      // If the user is not on the login page
      if(!$.mobile.activePage.is("#loginPage")){
         if($('.pop_up_haze').css('display') != 'block' &&
            $('.ui-datebox-container').size() === 0){
            // If the current page is the last page, loop back around to the front
            if(index === pages.length - 2){
               $.mobile.changePage(pages[0].page[0],{transition:'slide'});
            }
            // Otherwise, progress to the next page
            else {
               $.mobile.changePage(pages[index+1].page[0],{transition:'slide'});
            }
         }
      }
   });

   // When the footer is swiped right, change pages
   $(document).off('swiperight', 'div[data-role="footer"], body').on('swiperight', 'div[data-role="footer"], body', function(event){
      event.stopImmediatePropagation();

      // If the user is not on the login page
      if(!$.mobile.activePage.is("#loginPage")){
         if($('.pop_up_haze').css('display') != 'block' &&
            $('.ui-datebox-container').size() === 0){
            // If the current page is the first page, loop back around to the end
            if(index === 0){
               $.mobile.changePage(pages[pages.length-2].page[0],{transition:'slide', reverse: true });
            }
            // Otherwise, progress to the previous page
            else {
               $.mobile.changePage(pages[index-1].page[0],{transition:'slide', reverse: true });
            }
         }  
      }     
   });

   // When footer icon is clicked, change pages
   $(document).off('tap', 'div[data-role="footer"] span.symbol').on('tap', 'div[data-role="footer"] span.symbol', function(event){
      //event.stopImmediatePropagation();
      event.stopPropagation();

      // Get index for page to navigate to
      var page_id = $.mobile.activePage.attr('id');
      var index = $(this).index('#' + page_id + ' div[data-role="footer"] span.symbol');

      // If the index exists
	   if(index > -1){
	      // Change page
	      $.mobile.changePage(pages[index].page[0],{transition:'pop'});
      }
   });
   
   // Expand the navigation panel when the menu button is clicked
   $(document).off('tap', '#nav_button, #header_body').on('tap', '#nav_button, #header_body', function(event){
      event.stopPropagation();
      event.preventDefault();

      // If the user is not on the login page and the panel is closed
      if(!$.mobile.activePage.is("#loginPage") &&
         $('#nav_panel').hasClass('ui-panel-closed')){
         $('#nav_panel').panel().panel('open');
      }
   });

   // Don't close panel if clicked inside inner panel
   $(document).on('tap', 'div.ui-panel-inner', function(event){
      event.stopPropagation();
   });

   // When a page in the navigation panel is clicked, navigate pages
   $(document).off('tap', 'div.nav_page:not(.on_page)').on('tap', 'div.nav_page:not(.on_page)', function(event){
      event.stopPropagation();
      event.preventDefault();
      // Get index
      var index = $(this).index('div.nav_page');
      index = index % 5;

      setTimeout(
         function(){
            $('.pop_up_haze').hide();

            $.mobile.changePage(pages[index].page[0]);
         }, 
         301
      );
   });

   // Close panel if clicked anywhere on application besides inner panel
   $(document).off('tap', 'body').on('tap', 'body', function(event){
      $('#nav_panel').panel('close');
   });

   // Fade pop up haze in before panel opens
   $(document).off('panelbeforeopen', '#nav_panel').on('panelbeforeopen', '#nav_panel', function(event){
      $('.pop_up_haze').show();
   });

   // Fade pop up haze out before panel closes
   $(document).off('panelbeforeclose', '#nav_panel').on('panelbeforeclose', '#nav_panel', function(event){
      $('.pop_up_haze').hide();
   });

   // Change color of nav link when clicked
   $(document).on('touchstart', 'div.nav_page:not(.on_page)', function(event){
      $(this).css('color', '#ccc');
   });

   // Change color of nav link back
   $(document).on('touchend', 'div.nav_page:not(.on_page)', function(event){
      $(this).css('color', '#fff');
   });

   // Change color of footer icon when clicked
   $(document).on('touchstart', 'div[data-role="footer"] span.symbol:not(.page_on)', function(event){
      $(this).css('color', '#0F34AB');
   });

   // Change color of footer icon back
   $(document).on('touchstart', 'div[data-role="footer"] span.symbol:not(.page_on)', function(event){
      $(this).css('color', '#0c2577');
   });
});

// Before a document is shown
$(document).on('pagebeforeshow', function(){
   $('#nav_panel').panel();

   // Close any open dateboxes
   if($('div.ui-datebox-container').size() > 0){
      $('#search_date, #search_start_time, #search_end_time').datebox('close');
   }

   // If the active page is the login page, load the header but hide the footer
   if($.mobile.activePage.is("#loginPage")){
      // HTML code for the header
      var headerHtml = '<div id="header_body" width="100%">'+
      				'<img src="img/att_logo.png" style="float: right; margin: 8px 10px 10px 0px; height: 45px;" />'+
                     '<img src="img/header.png" />'+
                  '</div>';
      //$('[data-role="header"]').load("header.html").trigger('create');
      $('[data-role="header"]').html(headerHtml);
      $('[data-role="footer"]').hide();
   }
   // Otherwise
   else{
      // HTML code for the header
      var headerHtml = '<div id="header_body" width="100%">'+
                     '<h1><button type="button" class="btn ui-btn ui-btn-inline" id="nav_button">'+
                     '<i class="icon-minus-2"></i><i class="icon-minus-2"></i><i class="icon-minus-2"></i>'+
                     '</button>'+
                     '<img src="img/header.png" />'+
                  '</div>';

      // Add the HTML code for the header and show the footer
      $('[data-role="header"]').html(headerHtml);
      $('[data-role="footer"]').show();

      // Update the notification number on the user's reservations
      updateResNotify();

      $('#nav_panel').trigger( "updatelayout" );
   }
});

// When a page is shown
$(document).on('pageshow', function(){
   // Loop through the list of pages
   for(var i = 0; i < pages.length; i++){
      // If the page matches the active page, set the footer
      if($.mobile.activePage.is(pages[i].page[0])) {
         $('#nav_panel .nav_page').eq(i).addClass("on_page");

         // Update the footer icons for the currently active page
         footer(i);
         index = i;
      }
      else {
         $('#nav_panel .nav_page').eq(i).removeClass("on_page");
      }
   }

});

// Set the symbols in the footer
function footer(index) {
   var last_index = index - 1;

   // Wrap index back around to beginning
   if(last_index < 0){
      last_index = 3;
   }

   var page_id = $.mobile.activePage.attr('id');

   // Add appropriate class for on page
   $('#' + page_id + ' div[data-role="footer"] span.symbol').eq(last_index).removeClass('page_on');
   $('#' + page_id + ' div[data-role="footer"] span.symbol').eq(index).addClass('page_on');
}