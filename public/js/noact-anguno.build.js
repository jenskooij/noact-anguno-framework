/* Compiled JS */
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
window.callbacks = {};;
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
};
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
};
/**
 * Renders html from template
 * http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
 *
 * @param html A string of html to be rendered
 * @param options Data object of variables exposed to the template
 * @returns string The rendered html
 */
function renderTemplate (html, options) {
  var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n',
    cursor = 0, match;
  var add = function (line, js) {
    js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
      (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }
  while (match = re.exec(html)) {
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};
/**
 * Calls the url, renders the retrieved data on the given template,
 * manipulating the data using a datahandler, optinally calling the
 * callback function after it's done
 *
 * @param url
 * @param elem
 * @param templatePath
 * @param dataHandler
 * @param callback
 */
function renderEndpoint (url, elem, templatePath, dataHandler, callback) {
  var classNameHolder;

  classNameHolder = elem.className;
  elem.className = classNameHolder + ' no-loading';

  httpGetAsync(url, function (templateOptionsData) {
    if (isDebugEnabled()) {
      console.info("Retrieved data ", templateOptionsData, " from ", url);
    }

    if (typeof dataHandler === 'function') {
      templateOptionsData = dataHandler(templateOptionsData, elem);
      if (isDebugEnabled()) {
        console.info("Transformed data into ", templateOptionsData);
      }
    }

    httpGetAsync(templatePath, function (data) {
      elem.innerHTML = renderTemplate(data, templateOptionsData);
      elem.className = classNameHolder;

      if (typeof callback === 'function') {
        callback(elem);
      }
    }, function (data, status) {
      console.error("Couldn't retrieve template from path: ", templatePath, ", status ", status);
      elem.className = classNameHolder + ' no-error';
      if (typeof callback === 'function') {
        callback(elem);
      }
    });
  }, function (data, status) {
    console.error("Retrieved: ", data, " with status ", status);
    elem.className = classNameHolder + ' no-error';
    if (typeof callback === 'function') {
      callback(elem);
    }
  });
};
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
};
/**
 * Default dataHandler
 *
 * Used by noHandler, basically just json parses the data
 *
 * @param data
 * @returns {any}
 */
window.dataHandlers.noJsonDataHandler = function (data, elem) {
  return JSON.parse(data);
};;
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
    dataHandler = window.dataHandlers.noJsonDataHandler,
    callbackName = elem.getAttribute('data-no-callback'),
    callback = window.callbacks.noCallback;

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

  if (typeof window.callbacks[callbackName] === 'function') {
    callback = window.callbacks[callbackName];
  } else if (isDebugEnabled()) {
    if (callbackName !== null) {
      console.error("Callback ", callbackName, " is not a registered callback. Please register to window.callbacks");
    } else {
      console.info("Using default noCallback");
    }
  }

  renderEndpoint(elem.getAttribute('data-no-url'), elem, elem.getAttribute('data-no-template'), dataHandler, callback);
};;
window.callbacks.noCallback = function (elem) {
  elem.removeAttribute('data-no-url');
  elem.removeAttribute('data-no-template');
  elem.removeAttribute('data-no-data-handler');
  elem.removeAttribute('data-no-callback');
};;
afterDomLoads(function () {
  "use strict";

  /**
   * Determines whether or not the debug attribute data-no-debug is
   * set on the body tag and sets debugMode to true or false accordingly.
   * Removes the data attribute afterwards.
   */
  function initializeDebug () {
    var body = document.getElementsByTagName('body')[0];
    if (body !== undefined && body.hasAttribute('data-no-debug')) {
      var debug = body.getAttribute('data-no-debug');
      if (debug === 'true') {
        console.info('Debug mode is enabled.');
        debugMode = true;
      }
      body.removeAttribute('data-no-debug');
    }
  }

  /**
   * Dispatches an event from the window event so they can be picked up upon
   *
   * @param name
   */
  function dispatchEvent (name) {
    var event = new Event(name);
    window.dispatchEvent(event);
    if (isDebugEnabled()) {
      console.info("Event fired `", name, "`");
    }
  }

  /**
   * Initializes the framework.
   */
  function initializeNoActAnguNo () {
    dispatchEvent('no-initial-dom-loaded');
    initializeDebug();
    dispatchEvent('no-debug-initialized');
    dispatchEvent('no-dom-loaded');
    initializeHandlers(document);
    dispatchEvent('no-handlers-initialized');
  }

  initializeNoActAnguNo();
});;
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
};
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
};
