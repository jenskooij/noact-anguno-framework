/**
 * Function that executes is callback function executableFunction after
 * the entire dom is loaded.
 *
 * @param executableFunction function
 */
function afterDomLoads (executableFunction) {
  "use strict";
  if (window.attachEvent) {
    window.attachEvent('onload', executableFunction);
  } else {
    if (window.onload) {
      var curronload = window.onload;
      var newonload = function (evt) {
        curronload(evt);
        executableFunction(evt);
      };
      window.onload = newonload;
    } else {
      window.onload = executableFunction;
    }
  }
}