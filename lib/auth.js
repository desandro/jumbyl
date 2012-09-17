/*jshint devel: true, node: true */

"use strict";

// -------------------------- modules -------------------------- //

var fs = require('fs');
var colors = require('colors');
var path = require('path');
var _ = require('underscore');
var OAuth = require('oauth').OAuth;
var yaml = require('js-yaml');
var Router = require('./router');
var url = require('url');
var openUrl = require('openurl').open;
var hogan = require("hogan.js");

var jumbyl = require('./jumbyl');

// -------------------------- helpers -------------------------- //

// log red error message
function logError( message ) {
  console.log( 'Error'.red.underline + ( ': ' + message ).red );
}

// displays the message template with content from another file
function displayPage( response, context ) {
  // var content = fs.readFileSync( './views/' + contentFile, 'utf8' );

  var html = messageCompiled.render( context );
  response.html( html );
}

// -------------------------- mustache templates -------------------------- //

// returns compiled hogan template
function getTemplate( fileName ) {
  var filePath = path.resolve( __dirname, '../views/' + fileName + '.mustache' );
  var template = fs.readFileSync( filePath, 'utf8' );
  return hogan.compile( template );
}

var messageCompiled = getTemplate('message');
var successCompiled = getTemplate('success');

// -------------------------- let's begin -------------------------- //

var configFile = '_jumbyl.yml';

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;
var configFilePath = path.resolve( process.cwd(), configFile );
var configFileExists = existsSync( configFilePath );
// local vars
var config, auth, oauthToken, oauthSecret, router;


module.exports.auth = function authorize() {

  config = jumbyl.getConfig();

  if ( !config ) {
    logError( 'Config file "' + configFile +'" not found' );
    return;
  }

  if ( !config.consumerKey || !config.consumerSecret || !config.baseHostname ) {
    if ( !config.consumerKey ) {
      logError('Missing OAuth consumer key from ' + configFile );
    }
    if ( !config.consumerSecret ) {
      logError('Missing OAuth consumer secret from ' + configFile );
    }
    if ( !config.baseHostname ) {
      logError( 'Missing Tumblr blog base-hostname from ' + configFile );
    }
    return;
  }

  auth = new OAuth(
    'http://www.tumblr.com/oauth/request_token',
    'http://www.tumblr.com/oauth/access_token',
    config.consumerKey,
    config.consumerSecret,
    '1.0A', '/complete', 'HMAC-SHA1'
  );

  auth.getOAuthRequestToken( function( err, token, secret, results ) {
    if ( err ) {
      logError( 'Unable to get OAuth request token. ' + err.data );
      process.exit(1);
      return;
    }

    oauthToken = token;
    oauthSecret = secret;

    // start server
    // simple server for OAuth dance
    router = new Router();
    router.get( '/complete', handleComplete );
    router.server.listen('8080');
    // open tumblr authorization URL in browser
    var tumblrUrl = 'http://www.tumblr.com/oauth/authorize?oauth_token=' + oauthToken;
    console.log( 'Redirecting for Tumblr OAuth authorization' + "\n  " + tumblrUrl );
    openUrl( tumblrUrl );
  });

};



function handleComplete( request, response ) {

  var query = url.parse( request.url, true ).query;
  var verifier = query && query.oauth_verifier;
  var pageContent, deniedFilePath;

  // no verifier, OAuth failed or was denied
  if ( !verifier ) {
    logError('OAuth denied');
    deniedFilePath = path.resolve( __dirname, '../views/oauth-denied.mustache' );
    pageContent = fs.readFileSync( deniedFilePath, 'utf8' );
    displayPage( response, {
      yield: pageContent
    });
    // end page
    request.connection.destroy();
    router.server.close();
    process.exit(1);
    return;
  }

  var onOauthAccessGet = function( error, accessToken, accessSecret, results ) {
    if ( error ) {
      logError( 'Unable to get OAuth access. ' + error.data );
      process.exit(1);
      return;
    }
    // server confirmation page
    console.log( 'OAuth complete'.green );

    displayPage( response, {
      yield: successCompiled.render({ path: configFile })
    });
    request.connection.destroy();
    router.server.close();
    onAuthComplete( accessToken, accessSecret );
  };

  // get access token
  auth.getOAuthAccessToken( oauthToken, oauthSecret, verifier, onOauthAccessGet );

}

// write access keys to file
function onAuthComplete( accessToken, accessSecret ) {
  // fs.readFileSync( tumblrOauthFilePath, 'utf8' );
  var content = 'baseHostname: ' + config.baseHostname + "\n" +
    'consumerKey: ' + config.consumerKey + "\n" +
    'consumerSecret: ' + config.consumerSecret + "\n" +
    'accessToken: ' + accessToken + "\n" +
    'accessSecret: ' + accessSecret  + "\n";
  fs.writeFile( configFilePath, content, 'utf8', function() {
    console.log('Tumblr keys updated');
    process.exit();
  });
}

