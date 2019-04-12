"use strict";
const cc = require('cloud-control-frontend');

cc.targetCssFile='site.css';
cc.targetSassFile='site.build.css';
cc.targetJsFile='site.build.js';
cc.targetJsMinFile='site.js';
cc.targetJsPath='./public/js/';
cc.targetCssPath='./public/css/';

cc.run();