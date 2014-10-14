var first = true;

// When the page is initialized, set up event listeners
$(document).on('pageinit', '#aboutPage', function() {
   // When tutorial is tapped, open the tutorial page
   $(document).off('tap', '#tutorial').on('tap', '#tutorial', function(event) {
      // Save #aboutPage as location to return to
      localStorage.setItem("tutorialFrom", "#aboutPage");

      //Change pages
      $.mobile.changePage('#tutorialPage');
   });

   // Easter egg
   $(document).on('tap', '#button_caroline', function(event){
      event.stopPropagation();
      
      $('#about_caroline').hide();
      $('#about_caroline_egg').show();
   });
});

// When the page is shown for the first time, create the about table
$(document).on('pageshow', '#aboutPage', function() {
   // If this is the first time the page is being shown, create the table
   if(first){
      first = false;

      // Create the rows for the table with each person's information
      var allRows= '<tr>' +
                     '<td class="expand">Caroline Cliburn</td>' +
                     '<td>Delivery Team</td>' +
                     '<td>' +
                        '<button class="about_button_egg" id="button_caroline" align="left"></button>' +
                        '<img src="img/about/Caroline.jpg" class="about_img" id="about_caroline" align="left">' +
                        '<img src="img/about/fairy.png" class="about_img_egg" id="about_caroline_egg" align="left">' +
                        '<span class="about_text">Caroline is a proud Baylor Bear studying Physics and going into her junior year.' +
                        ' She loves being outside, coffee, and acts as the team goof ball.</span>' + 
                     '</td>' +
                  '</tr>' +
                  '<tr>' +
                     '<td class="expand">Thomas Kennedy</td>' +
                     '<td>Delivery Team</td>' +
                     '<td>' +
                        '<img src="img/about/Tom.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Tom is studying Computer Science at SMU, and will be a junior this fall.' +
                        ' He loves all sports, especially basketball.</p>' +
                     '</td>' +
                  '</tr>' +
                  '<tr>'+
                     '<td class="expand">Myles McArthur</td>' +
                     '<td>Product Manager</td>' +
                     '<td>' +
                        '<img src="img/about/Myles.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Myles is studying MIS at Baylor University and will be a sophomore this fall.' +
                        ' He enjoys playing soccer and ping-pong.</p>' +
                     '</td>' +
                  '</tr>' +
                  '<tr>' +
                     '<td class="expand">Katherine O\'Neil</td>' +
                     '<td>Scrum Master</td>' +
                     '<td>' +
                        '<img src="img/about/Katie.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Katie just graduated from SMU with a B.S. in Environmental Engineering and is' +
                        ' pursuing her M.S. in Environmental Engineering this coming Fall. She is a self-proclaimed "Dallasite"' +
                        ' who loves walks on the Katy Trail and brunch at the Old Monk.</p>' +
                     '</td>' + 
                  '</tr>' +
                  '<tr>' +
                     '<td class="expand">Nariana Sands</td>' +
                     '<td>Delivery Team</td>' +
                     '<td>' +
                        '<img src="img/about/Nariana.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Nariana is a junior at SMU studying Computer Science with a minor in Math.' +
                        ' She never leaves the house without wearing something yellow.</p>' +
                     '</td>' +
                  '</tr>' +
                  '<tr>' +
                     '<td class="expand">Shane St. Luce</td>' +
                     '<td>Delivery Team</td>' +
                     '<td>' +
                        '<img src="img/about/Shane.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Shane is a senior at UTD studying Software Engineering and a Master\'s in' +
                        ' Systems Engineering and Management. He\'s always been fond of music, playing multiple brass instruments,' +
                        ' piano, and some guitar.</p>' +
                     '</td>' +
                  '<tr>' +
                     '<td>Story Zanetti</td>' +
                     '<td>Delivery Team</td>' +
                     '<td>' +
                        '<img src="img/about/Story.jpg" class="about_img" align="left">' +
                        '<p class="about_text">Story is a junior at SMU majoring in Computer Science and Applied/ Numerical' +
                        ' Mathematics. She is the proud owner of a tortoise named Speedy and a rabbit named Galaxy.</p>' +
                     '</td>' +
                  '</tr>';

      // Create the structure of the table
      var newTable = '<table class="footable toggle-arrow" id="about_table">' +
                        '<thead>' +
                           '<tr>' +
                              '<th data-class="expand">Name</th>' +
                              '<th data-sort-initial="descending">Role</th>' +
                              '<th data-hide="phone,tablet"></th>' +
                           '</tr>' +
                        '</thead>' +
                        '<tbody id="about_body">' +
                           allRows +
                        '</tbody>' +
                     '</table>';

      // Append the table, run footable on it, and animate it in
      $('#aboutInterns').append(newTable);
      $('#about_table').footable();
      $('#about_table').animate(
         {
            opacity: 1
         },
         500
      );
   }
});