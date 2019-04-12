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
}

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
}

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
    elem.className = classNameHolder;
    if (isDebugEnabled()) {
      console.info("Retrieved data ", templateOptionsData, " from ", url);
    }

    if (typeof dataHandler === 'function') {
      templateOptionsData = dataHandler(templateOptionsData);
      if (isDebugEnabled()) {
        console.info("Transformed data into ", templateOptionsData);
      }
    }

    httpGetAsync(templatePath, function (data) {
      var renderedHtml = renderTemplate(data, templateOptionsData);
      elem.innerHTML = renderedHtml;

      if (typeof callback === 'function') {
        callback(elem);
      }
    }, function (data, status) {
      console.error("Couldn't retrieve template from path: ", templatePath, ", status ", status);
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
}

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

afterDomLoads(function () {
  "use strict";

  /**
   * Finds all elements that have a data-no-handler attribute
   * and tries to find and run its handler
   */
  function initializeHandlers () {
    var handlees = document.querySelectorAll('[' + handlerAttributeName + ']'),
      i,
      handlerName;

    for (i = 0; i < handlees.length; i += 1) {
      handlerName = handlees[i].getAttribute(handlerAttributeName);

      if (typeof window.handlers[handlerName] === 'function') {
        if (isDebugEnabled()) {
          console.info('Executing `', handlerName, "` for element ", handlees[i]);
        }
        window.handlers[handlerName](handlees[i]);
        handlees[i].removeAttribute(handlerAttributeName);
      } else {
        console.error('Element ', handlees[i], " has invalid handler `", handlerName, "`");
      }
    }
  }

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
   * Initializes the framework.
   */
  function initializeNoActAnguNo () {
    initializeDebug();
    initializeHandlers();
  }

  initializeNoActAnguNo();
});;
