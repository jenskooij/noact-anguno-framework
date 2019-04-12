"use strict";
const cc = require('cloud-control-frontend');

cc.targetCssFile='site.css';
cc.targetSassFile='site.build.css';
cc.targetJsFile='noact-anguno.build.js';
cc.targetJsMinFile='noact-anguno.js';
cc.targetJsPath='./public/js/';
cc.targetCssPath='./public/css/';

cc.run();