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
}