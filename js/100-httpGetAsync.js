/**
 * Asynchronously calls theUrl. When this is successful, calls
 * the callback, with the retrieved data as argument. If it fails,
 * calls the errorCallback with the data and status as arguments
 *
 * @param theUrl string
 * @param callback function
 * @param errorCallback function
 */
function httpGetAsync (theUrl, callback, errorCallback) {
  "use strict";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.responseText);
    } else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
      errorCallback(xmlHttp.responseText, xmlHttp.status);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}