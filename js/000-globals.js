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
 * @type {{}}
 */
window.dataHandlers = {};

/**
 * An object on the window object containing all handlers.
 * Adding your own is a simple as:
 * window.handlers.myHandler = function (elem) {};
 *
 * @type {{}}
 */
window.handlers = {};