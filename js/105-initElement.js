/**
 * Initializes one individual element
 * @param elem
 */
function initElement(elem) {
  var handlerName = elem.getAttribute(handlerAttributeName);

  if (typeof window.handlers[handlerName] === 'function') {
    if (isDebugEnabled()) {
      console.info('Executing `', handlerName, "` for element ", elem);
    }
    window.handlers[handlerName](elem);
    elem.removeAttribute(handlerAttributeName);
  } else {
    console.error('Element ', elem, " has invalid handler `", handlerName, "`");
  }
}