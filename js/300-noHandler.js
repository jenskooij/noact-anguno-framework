/**
 * Default handler
 *
 * Retrives the url as passed in through the data-no-url attribute,
 * Renders the template from the data-no-template attribute
 * Optionally uses a set data handler in data-no-data-handler, if non is present
 * or an invalid one is set, it uses noJsonDataHandler
 *
 * @param elem
 */
window.handlers.noHandler = function (elem) {
  var dataHandlerName = elem.getAttribute('data-no-data-handler'),
    dataHandler = window.dataHandlers.noJsonDataHandler;

  if (isDebugEnabled()) {
    console.info("Datahandler: ", dataHandlerName);
  }

  if (typeof window.dataHandlers[dataHandlerName] === 'function') {
    dataHandler = window.dataHandlers[dataHandlerName];
  } else if (isDebugEnabled()) {
    if (dataHandlerName !== null) {
      console.error("Datahandler ", dataHandlerName, " is not a registered handler. Please register to window.dataHandlers");
    } else {
      console.info("Using default noJsonDataHandler");
    }
  }

  renderEndpoint(elem.getAttribute('data-no-url'), elem, elem.getAttribute('data-no-template'), dataHandler, function (elem) {
    elem.removeAttribute('data-no-url');
    elem.removeAttribute('data-no-template');
    elem.removeAttribute('data-no-data-handler');
  });
};