/**
 * Default dataHandler
 *
 * Used by noHandler, basically just json parses the data
 *
 * @param data
 * @returns {any}
 */
window.dataHandlers.noJsonDataHandler = function (data) {
  return JSON.parse(data);
};