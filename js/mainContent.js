window.handlers.mainContent = function (elem) {
  "use strict";
  renderJsonEndpoint('https://www.kngf.nl/api/news', elem, 'no-templates/news.html');
};