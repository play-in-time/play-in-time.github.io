/** util.js: Helper utility functions for app.js
  *
  * http://playinti.me/app
  * (c) inTime dev team
  * Source available at https://github.com/play-in-time/play-in-time.github.io/tree/master/app
  */

/* To avoid code reuse, we encapsulate these operations in a single function that
 * can be called asynchronously from the API callback functions.
 *
 * tracklist: The Spotify-formatted list of track elements
 */
function displayResultsMakeButton(tracklist) {
  var results = $("#results");
  var results_left = $("#results-left");
  var results_right = $("#results-right");
  var totalTime = 0;
  var id_list = []; // Stores the returned list of song ids
  for (var i=0; i < tracklist.length; i++) { // Display list of song names, build list of ids
    var track = tracklist[i].track;
    var name = track.name;
    var duration = (track.duration_ms / 1000)/60;
    totalTime += duration;

    resultList = $("#resultslist");
    tag = "<li>" + name + " (" + duration.toFixed(2) + " min)</li>";
    resultList.append(tag);
    id_list.push(track.id);
  }

  results_left.append("<p id=\"total\">Total time: "+totalTime.toFixed(2)+" min</p>");

  var player = "<iframe src=\"https://embed.spotify.com/?uri=spotify:trackset:inTime:" + id_list.join(',') + "\" width=\"300\" height=\"380\" frameborder=\"0\" allowtransparency=\"true\"></iframe>";

  results_right.css("width", "300px");
  results_right.append(player);

  results.show(); // Show results here, avoid showing results before request completes
}

/* Disable the play button while a request is processing */
function disablePlayButton() {
  var button = $("#playbutton");
  button.text("Loading...");
  button[0].disabled = true; // I'm disabled!
}

/* Re-Enable the play button */
function enablePlayButton() {
  var button = $("#playbutton");
  button.text("Play!");
  button[0].disabled = false;
}
