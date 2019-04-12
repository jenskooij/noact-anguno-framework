window.callbacks.noCallback = function (elem) {
  elem.removeAttribute('data-no-url');
  elem.removeAttribute('data-no-template');
  elem.removeAttribute('data-no-data-handler');
  elem.removeAttribute('data-no-callback');
  initializeHandlers(elem); // Makes sure that the rendered HTML also gets treated by the framework
};