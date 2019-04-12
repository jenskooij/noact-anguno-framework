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
});