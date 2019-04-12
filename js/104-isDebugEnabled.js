/**
 * Returns true or false, depending on whether or not a
 * debug attribute (data-no-debug) has been placed on the
 * body tag at the time of DOM load. Variable debugMode is
 * set during initializeDebug().
 *
 * @returns {boolean}
 */
function isDebugEnabled () {
  return debugMode;
}