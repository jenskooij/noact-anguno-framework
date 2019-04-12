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
};