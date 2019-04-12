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
}