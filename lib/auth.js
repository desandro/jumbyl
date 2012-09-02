/*jshint undef: true, devel: true */
/*global setTimeout: false */

var fs = require('fs');
var colors = require('colors');
var path = require('path');
var _ = require('underscore');
var OAuth = require('oauth').OAuth;
var yaml = require('js-yaml');
var router = require('./node-router');
var url = require('url');
var openUrl = require('openurl').open;

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
var tumblrOauthFilePath = path.resolve( process.cwd(), options.tumblrOauthFile );
var oauthFileExists = existsSync( tumblrOauthFilePath );

if ( !oauthFileExists ) {
  logError( 'Tumblr OAuth file "' + options.tumblrOauthFile +'" not found' );
  return;
}

var oauthFile = fs.readFileSync( tumblrOauthFilePath, 'utf8' );
var oauthKeys = yaml.load( oauthFile );

// console.log( oauthKeys );

if ( !oauthKeys.consumerKey || !oauthKeys.consumerSecret ) {
  if ( !oauthKeys.consumerKey ) {
    logError('Missing OAuth consumer key from ' + options.tumblrOauthFile );
  }
  if ( !oauthKeys.consumerSecret ) {
    logError('Missing OAuth consumer secret from ' + options.tumblrOauthFile );
  }
  return;
}

var auth = new OAuth(
  'http://www.tumblr.com/oauth/request_token',
  'http://www.tumblr.com/oauth/access_token',
  oauthKeys.consumerKey,
  oauthKeys.consumerSecret,
  '1.0A', '/complete', 'HMAC-SHA1'
);

var oauthToken, oauthSecret;

// simple server for OAuth dance
var server = router.getServer();

server.get( '/complete', handleComplete );

auth.getOAuthRequestToken( function( err, token, secret, results ) {
  if ( err ) {
    logError( 'Unable to get OAuth request token. ' + err.data );
    return;
  }

  oauthToken = token;
  oauthSecret = secret;

  // start server
  server.listen('8080');
  // open tumblr authorization URL in browser
  var tumblrUrl = 'http://www.tumblr.com/oauth/authorize?oauth_token=' + oauthToken;
  console.log( 'Redirecting for Tumblr OAuth authorization' + "\n  " + tumblrUrl );
  openUrl( tumblrUrl );
});


function handleComplete( request, response ) {

  var query = url.parse( request.url, true ).query;
  var verifier = query && query.oauth_verifier;
  if ( !verifier ) {
    logError('OAuth denied');
    response.simpleHtml( 200, 'OAuth denied' );
    request.connection.destroy();
    server.end();
    return;
  }

  var onOauthAccessGet = function( error, accessToken, accessSecret, results ) {
    if ( error ) {
      logError( 'Unable to get OAuth access. ' + error.data );
      return;
    }
    // server confirmation page
    console.log( 'OAuth complete'.green );
    response.simpleHtml( 200, accessToken + '<br>' + accessSecret );
    request.connection.destroy();
    server.end();
    onAuthComplete( accessToken, accessSecret );
  };

  // get access token
  auth.getOAuthAccessToken( oauthToken, oauthSecret, verifier, onOauthAccessGet );
}


function onAuthComplete( accessToken, accessSecret ) {
  // fs.readFileSync( tumblrOauthFilePath, 'utf8' );
  var content = 'consumerKey: ' + oauthKeys.consumerKey + "\n" +
    'consumerSecret: ' + oauthKeys.consumerSecret + "\n" +
    'accessToken: ' + accessToken + "\n" +
    'accessSecret: ' + accessSecret  + "\n";
  fs.writeFile( options.tumblrOauthFile, content, 'utf8', function() {
    console.log('Tumblr keys updated');
  });
}

