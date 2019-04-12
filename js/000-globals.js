/**
 * The attribute in which the handlers are set for elements
 *
 * @type {string}
 */
var handlerAttributeName = 'data-no-handler',
  /**
   * Whether or not debugMode is enabled. Dont use
   * directly, use isDebugEnabled() instead.
   * @readonly
   * @type {boolean}
   */
  debugMode = false;

/**
 * An object on the window object containing all data handlers.
 * Adding your own is a simple as:
 * window.dataHandlers.myHandler = function (data) { return data; };
 *
 * @type {{noJsonHandler: (function(*=): any)}}
 */
window.dataHandlers = {
  "noJsonHandler": function (data) {
    return JSON.parse(data);
  }
};

/**
 * An object on the window object containing all handlers.
 * Adding your own is a simple as:
 * window.handlers.myHandler = function (elem) {};
 *
 * @type {{noHandler: Window.handlers.noHandler}}
 */
window.handlers = {
  "noHandler": function (elem) {
    var dataHandlerName = elem.getAttribute('data-no-data-handler'),
      dataHandler = window.dataHandlers.noJsonHandler;

    if (isDebugEnabled()) {
      console.info("Datahandler: ", dataHandlerName);
    }

    if (typeof window.dataHandlers[dataHandlerName] === 'function') {
      dataHandler = window.dataHandlers[dataHandlerName];
    } else if (isDebugEnabled()) {
      if (dataHandlerName !== null) {
        console.error("Datahandler ", dataHandlerName, " is not a registered handler. Please register to window.dataHandlers");
      } else {
        console.info("Using default noJsonHandler");
      }
    }

    renderEndpoint(elem.getAttribute('data-no-url'), elem, elem.getAttribute('data-no-template'), dataHandler, function (elem) {
      elem.removeAttribute('data-no-url');
      elem.removeAttribute('data-no-template');
      elem.removeAttribute('data-no-data-handler');
    });
  }
};