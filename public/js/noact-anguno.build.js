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

    getTemplate(templatePath, elem, function (success, html) {
      if (success === false) {
        elem.className = classNameHolder + ' no-error';
      } else {
        elem.innerHTML = renderTemplate(html, templateOptionsData);
        elem.className = classNameHolder;
      }

      if (typeof callback === 'function') {
        callback(elem);
      } else if (isDebugEnabled()) {
        console.error("Callback ", callback, " is not a function");
      }
    });
  }, function (data, status) {
    console.error("Retrieved: ", data, " with status ", status);
    elem.className = classNameHolder + ' no-error';
    if (typeof callback === 'function') {
      callback(elem);
    } else if (isDebugEnabled()) {
      console.error("Callback ", callback, " is not a function");
    }
  });
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
 * JavaScript implementation of Java's String.hashCode method
 *
 * @source https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param stringToBeHashed
 * @returns {number}
 */
function hashCode(stringToBeHashed) {
  var hash = 0, i, chr;
  if (stringToBeHashed.length === 0) return hash;
  for (i = 0; i < stringToBeHashed.length; i++) {
    chr   = stringToBeHashed.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
/**
 * Feature detection for local storage
 *
 * @source https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 * @param type
 * @returns {boolean|boolean|*}
 */
function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
        // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
};
/**
 * Retrieves the template
 *
 * @param templatePath
 * @param elem
 * @param callback
 */
function getTemplate (templatePath, elem, callback) {
  var templateHash = hashCode(templatePath),
    templateCacheKey = "tmpl:" + templateHash,
    templateCacheTimestampKey = templateCacheKey + ":ts";

  if (isDebugEnabled()) {
    console.info("Wont use cache for templates, because debugMode = true.");
    httpGetAsync(templatePath, function (html) {
      if (typeof callback === 'function') {
        callback(true, html);
      }
    }, function (html, status) {
      console.error("Couldn't retrieve template from path: ", templatePath, ", status ", status);
      if (typeof callback === 'function') {
        callback(false, html);
      }
    });
  } else {
    if (storageAvailable('localStorage')) {
      // check storage
      if (!localStorage.getItem(templateCacheKey) && !localStorage.getItem(templateCacheTimestampKey)) {
        // populate storage
        populateStorage(templatePath, templateCacheKey, templateCacheTimestampKey, callback);
      } else {
        // check storage
        var templateCacheTimestamp = parseInt(localStorage.getItem(templateCacheTimestampKey)),
          currentTimestamp = getCurrentTimestamp(),
          cacheAge = currentTimestamp - templateCacheTimestamp;

        if (cacheAge > templateCacheMaxAge) {
          if (isDebugEnabled()) {
            console.info("Cache expired for ", templatePath, ", renewing cache");
          }

          populateStorage(templatePath, templateCacheKey, templateCacheTimestampKey, callback);
        } else {
          if (isDebugEnabled()) {
            console.info("Cache for ", templatePath, " is recent, use it.");
          }
          callback(true, localStorage.getItem(templateCacheKey));
        }
      }

    } else if (isDebugEnabled()) {
      console.error("No localStorage available.");
    }
  }



}

function getCurrentTimestamp() {
  return Math.floor(new Date().valueOf() / 1000);
}

function populateStorage (templatePath, templateCacheKey, templateCacheTimestampKey, callback) {
  httpGetAsync(templatePath, function (html) {
    if (typeof callback === 'function') {
      localStorage.setItem(templateCacheKey, html);
      localStorage.setItem(templateCacheTimestampKey, getCurrentTimestamp().toString());
      callback(true, html);
    }
  }, function (html, status) {
    console.error("Couldn't retrieve template from path: ", templatePath, ", status ", status);
    if (typeof callback === 'function') {
      callback(false, html);
    }
  });
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
  initializeHandlers(elem); // Makes sure that the rendered HTML also gets treated by the framework
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
