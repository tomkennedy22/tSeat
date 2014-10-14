var index = 1;

// When the tutorial page is initialized
$(document).on('pageinit', '#tutorialPage', function(){
   // When the close button is tapped, close the tutorial
   $(document).off('tap', '#skip').on('tap', '#skip', function(event, data){
      close();
   });

   // When the screen is swiped to the right, move to the previous step
   $(document).off('swiperight', '#tutorialPage').on('swiperight', '#tutorialPage', function(event){
      event.stopPropagation();
      prevStep();
   });

   // When the back button is tapped, move to the previous step
   $(document).off('tap', '#tutorialPage #back_step').on('tap', '#tutorialPage #back_step', function(event){
      event.stopPropagation();
      prevStep();
   });

   // When the screen is swiped to the left, move to the next step
   $(document).off('swipeleft', '#tutorialPage').on('swipeleft', '#tutorialPage', function(event){
      event.stopPropagation();
      nextStep();
   });

   // When the next button is tapped, move to the next step
   $(document).off('tap', '#tutorialPage #next_step').on('tap', '#tutorialPage #next_step', function(event){
      event.stopPropagation();
      nextStep();
   });
});

// Before the page is shown, load the first step
$(document).on('pagebeforeshow', '#tutorialPage', function(){
   index = 1;
   $('#tutorialPage img').attr('src', 'img/tutorial/step_1.png');
   $('#tutorialPage #back_step').hide();
   $('#tutorialPage #skip span').css('background-color', '#b30a3c');
});

// Moves the user on to the next step
function nextStep(){
   // Set the index
   if(index === 15){
      close();
   }
   else {
      if(index === 1){
         $('#tutorialPage #back_step').show();
      }

      index++;
      // Change the picture
      $('#tutorialPage img').attr('src','img/tutorial/step_' + index + '.png');
   }
}

// Moves the user back to the previous step
function prevStep(){
   // Set the index
   if(index != 1){
      index--;

      if(index === 1){
         $('#tutorialPage #back_step').hide();
      }

      // Change the picture
      $('#tutorialPage img').attr('src','img/tutorial/step_' + index + '.png');
   }
}

// Redirects the user back to the page he came from
function close(){
   $.mobile.changePage(localStorage.getItem("tutorialFrom"),{transition:'pop'});
}