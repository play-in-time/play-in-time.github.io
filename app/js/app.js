/** app.js: Hooks for UI behaviour
  *
  * http://playinti.me/app
  * (c) inTime dev team
  * Source available at https://github.com/play-in-time/play-in-time.github.io/tree/master/app
  */

var playlists = {}; // Map of playlists available (name) -> (id)

var minutesInput = ""; // The previously-inputted minutes value
var timeInput = ""; // The previously-inputted time value

/* This is inactive for now:
var client_id = '29a0ec9178864f69b5e5e181811254ed';
var redirect_uri = 'http://playinti.me/callback.html';
function doLogin() {
  var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
            '&response_type=token' +
            '&scope=playlist-read-private%20playlist-modify%20playlist-modify-private' +
            '&redirect_uri=' + encodeURIComponent(redirect_uri);
  var w = window.open(url, 'asdf', 'WIDTH=400,HEIGHT=500');
}*/

/* Updates the text input box with default values, or previously-filled-out values */
function updateInputBox() {
  var dropdownValue = $("#selectmode")[0].value;
  var inputBox = $("#inputbox")[0];
  var units = $("#units");
  
  if (dropdownValue == "for") {
    timeInput = inputBox.value;
    inputBox.value = minutesInput;
    inputBox.placeholder = "42.5";
    units.text("minutes");
  } else {
    minutesInput = inputBox.value;
    inputBox.value = timeInput;

    inputBox.placeholder = "13:05";
    units.text("local time");
  }
}

/* When the state of the "Select mode" dropdown changes, update the input box */
$("#selectmode").change(function() {
  updateInputBox();
});

/* When the play button is clicked, submit request to the server */
$("#playbutton").click(function() {
    var now = Math.floor(Date.now() / 1000); // Current time in seconds

    /* Grab UI elements: */
    var inputBoxValue = $("#inputbox")[0].value;
    var mode = $("#selectmode")[0].value;
    var playlist = $("#selectPlaylist")[0].value;

    var results = $("#results");
    var results_left = $("#results-left");
    var results_right = $("#results-right");
    var loading = $("#loading");

    /* Clear previous results: */
    enablePlayButton(); // Enable the play button if it's not already
    $("#total").remove(); // Remove total time text
    $("li").remove(); // Remove all result elements
    $("iframe").remove(); // Remove spotify play element
    results_right.css("width", "0"); // Reset width on right column

    /* Check for user input error */
    if (inputBoxValue == "") {
      results_left.append("<p style=\"color:red\" class=\"err\">Please specify a time!</p>");
      results.show();
      return;
    }
    
    var duration = 0;
    var id = '0';
    if (mode == "for") { // Play for a specified number of minutes
      duration = parseInt(inputBoxValue)*60;
      id = playlists[playlist];
    } else { // TODO: Implement play until a specified time
      results_left.append("<p style=\"color:red\" class=\"err\">This mode isn't supported yet, sorry!</p>");
      results.show();
      return;
    }
    
    results.hide(); // Don't hide results until now - allows to display multiple errors
    $(".err").remove(); // Only remove .err elems after a successful input is formulated

    var playMode = $("input[name=playmode]:checked").val(); // Get request type
    disablePlayButton(); // Disable button until request completes

    /* Make API request: Either for a specific playlist, or for 'just play' */
    if (playMode == "playlist") {
      var params = {'playlist_id': id, 'duration': duration};
      $.get("http://api.playinti.me/tracks_for_duration", params, function(res) {
          enablePlayButton();
          displayResultsMakeButton(res.tracklist);
      });
    } else { // Make 'just play!' request
      var params = {'duration': duration};
      $.get("http://api.playinti.me/just_play", params, function(res) {
          enablePlayButton();
          displayResultsMakeButton(res.tracklist);
      });
    }
});

/* When the page loads, do some setup stuff */
$(document).ready(function() {
  updateInputBox(); // Update the text input box to match the default

  // Fill out dropdown for playlist select:
  $.get('http://api.playinti.me/playlists', {}, function(res) {
      response = res.playlists;
      dropdown = $("#selectPlaylist");
     
      for (var i=0; i < response.length; i++) {
        var option = response[i].playlist_name;

        playlists[option] = response[i].playlist_id;
        dropdown.append("<option>"+option+"</option>");
      }
  });

  $("#results").hide();
});
