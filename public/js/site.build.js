/* Compiled JS */
var handlerAttributeName = 'data-no-handler',
  debugMode = false;

window.handlers = {
  "noHandler": function (elem) {
    renderJsonEndpoint(elem.getAttribute('data-no-url'), elem, elem.getAttribute('data-no-template'), null, function (elem) {
      elem.removeAttribute('data-no-url');
      elem.removeAttribute('data-no-template');
    });
  }
};

function httpGetAsync(theUrl, callback, errorCallback) {
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
function renderTemplate(html, options) {
  var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
  var add = function(line, js) {
    js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
      (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }
  while(match = re.exec(html)) {
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

function renderJsonEndpoint(url, elem, templatePath, dataHandler, callback) {
  var classNameHolder;

  classNameHolder = elem.className;
  elem.className = classNameHolder + ' no-loading';

  httpGetAsync(url, function (templateOptionsData) {
    elem.className = classNameHolder;
    if (isDebugEnabled()) {
      console.info("Retrieved data ", templateOptionsData, " from ", url);
    }

    httpGetAsync(templatePath, function (data) {
      var renderedHtml = renderTemplate(data, JSON.parse(templateOptionsData));
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

function isDebugEnabled() {
  return debugMode;
}

afterDomLoads(function () {
  "use strict";
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

  function initializeDebug () {
    var body = document.getElementsByTagName('body')[0];
    if (body !== undefined && body.hasAttribute('data-no-debug')) {
      var debug = body.getAttribute('data-no-debug');
      if (debug === 'true') {
        console.info('Debug mode is enabled.');
        debugMode = true;
      }
    }
  }

  function initializeNoActAnguNo() {
    initializeDebug();
    initializeHandlers();
  }

  initializeNoActAnguNo();
});;
window.handlers.mainContent = function (elem) {
  "use strict";
  renderJsonEndpoint('https://www.kngf.nl/api/news', elem, 'no-templates/news.html');
};;
