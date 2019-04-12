/**
 * Finds all elements that have a data-no-handler attribute
 * and tries to find and run its handler
 * @param elem
 */
function initializeHandlers (elem) {
  var handlees = elem.querySelectorAll('[' + handlerAttributeName + ']'),
    i;

  for (i = 0; i < handlees.length; i += 1) {
    initElement(handlees[i]);
  }
}