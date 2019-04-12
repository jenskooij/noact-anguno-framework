var handlerAttributeName="data-no-handler",debugMode=!1;function httpGetAsync(e,n,t){"use strict";var a=new XMLHttpRequest;a.onreadystatechange=function(){4===a.readyState&&200===a.status?n(a.responseText):4===a.readyState&&200!==a.status&&t(a.responseText,a.status)},a.open("GET",e,!0),a.send(null)}function renderTemplate(e,n){for(var t,a=/<%([^%>]+)?%>/g,o=/(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,r="var r=[];\n",i=0,d=function(e,n){return r+=n?e.match(o)?e+"\n":"r.push("+e+");\n":""!=e?'r.push("'+e.replace(/"/g,'\\"')+'");\n':"",d};t=a.exec(e);)d(e.slice(i,t.index))(t[1],!0),i=t.index+t[0].length;return d(e.substr(i,e.length-i)),r+='return r.join("");',new Function(r.replace(/[\r\t\n]/g,"")).apply(n)}function afterDomLoads(n){"use strict";if(window.attachEvent)window.attachEvent("onload",n);else if(window.onload){var t=window.onload;window.onload=function(e){t(e),n(e)}}else window.onload=n}function renderEndpoint(e,t,a,o,r){var i;i=t.className,t.className=i+" no-loading",httpGetAsync(e,function(n){isDebugEnabled()&&console.info("Retrieved data ",n," from ",e),"function"==typeof o&&(n=o(n,t),isDebugEnabled()&&console.info("Transformed data into ",n)),httpGetAsync(a,function(e){t.innerHTML=renderTemplate(e,n),t.className=i,"function"==typeof r&&r(t)},function(e,n){console.error("Couldn't retrieve template from path: ",a,", status ",n),t.className=i+" no-error","function"==typeof r&&r(t)})},function(e,n){console.error("Retrieved: ",e," with status ",n),t.className=i+" no-error","function"==typeof r&&r(t)})}function initElement(e){var n=e.getAttribute(handlerAttributeName);"function"==typeof window.handlers[n]?(isDebugEnabled()&&console.info("Executing `",n,"` for element ",e),window.handlers[n](e),e.removeAttribute(handlerAttributeName)):console.error("Element ",e," has invalid handler `",n,"`")}window.dataHandlers={},window.handlers={},window.callbacks={},window.dataHandlers.noJsonDataHandler=function(e,n){return JSON.parse(e)},window.handlers.noHandler=function(e){var n=e.getAttribute("data-no-data-handler"),t=window.dataHandlers.noJsonDataHandler,a=e.getAttribute("data-no-callback"),o=window.callbacks.noCallback;isDebugEnabled()&&console.info("Datahandler: ",n),"function"==typeof window.dataHandlers[n]?t=window.dataHandlers[n]:isDebugEnabled()&&(null!==n?console.error("Datahandler ",n," is not a registered handler. Please register to window.dataHandlers"):console.info("Using default noJsonDataHandler")),"function"==typeof window.callbacks[a]?o=window.callbacks[a]:isDebugEnabled()&&(null!==a?console.error("Callback ",a," is not a registered callback. Please register to window.callbacks"):console.info("Using default noCallback")),renderEndpoint(e.getAttribute("data-no-url"),e,e.getAttribute("data-no-template"),t,o)},afterDomLoads(function(){"use strict";function e(e){var n=new Event(e);window.dispatchEvent(n),isDebugEnabled()&&console.info("Event fired `",e,"`")}var n;e("no-initial-dom-loaded"),void 0!==(n=document.getElementsByTagName("body")[0])&&n.hasAttribute("data-no-debug")&&("true"===n.getAttribute("data-no-debug")&&(console.info("Debug mode is enabled."),debugMode=!0),n.removeAttribute("data-no-debug")),e("no-debug-initialized"),e("no-dom-loaded"),initializeHandlers(document),e("no-handlers-initialized")});