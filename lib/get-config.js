/*jshint devel: true, node: true */

'use strict';

// -------------------------- modules -------------------------- //

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

// -------------------------- getConfig -------------------------- //

var configFile = '_jumbyl.yml';

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;
var configFilePath = path.resolve( process.cwd(), configFile );

function getConfig() {
  if ( !existsSync( configFilePath ) ) {
    return false;
  }
  var fileContent = fs.readFileSync( configFilePath, 'utf8' );
  var config =  yaml.load( fileContent );
  return config;
}

module.exports.getConfig = getConfig;
