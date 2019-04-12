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
  debugMode = false,
  /**
   * Max age in seconds of the cache of templates
   * Defaults to five minutes
   * @type {number}
   */
  templateCacheMaxAge = 60 * 5;

/**
 * An object on the window object containing all data handlers.
 * Adding your own is a simple as:
 * window.dataHandlers.myHandler = function (data, elem) { return data; };
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

/**
 * An object on the window object containing all callbacks.
 * Adding your own is a simple as:
 * window.handlers.myCallback = function (elem) {};
 *
 * @type {{}}
 */
window.callbacks = {};