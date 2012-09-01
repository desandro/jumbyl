var fs = require('fs');
var colors = require('colors');
var path = require('path');
var _ = require('underscore');
var OAuth = require('oauth').OAuth;
var yaml = require('js-yaml');

// log red error message
function logError( message ) {
  console.log( 'Error'.red.underline + ( ': ' + message ).red );
}

var defaults = {
  tumblrOauthFile: '_tumblr-oauth.yml'
};

var options = _.extend( defaults, {} );

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

var oauthFileExists = existsSync( path.resolve( process.cwd(), options.tumblrOauthFile ));

if ( !oauthFileExists ) {
  logError( 'Tumblr OAuth file "' + options.tumblrOauthFile +'" not found' );
  return;
}

