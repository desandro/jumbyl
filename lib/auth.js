/*jshint devel: true, node: true */

"use strict";

// -------------------------- dependencies -------------------------- //

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
  var template = fs.readFileSync( './views/' + fileName + '.mustache', 'utf8' );
  return hogan.compile( template );
}

var messageCompiled = getTemplate('message');
var successCompiled = getTemplate('success');

// -------------------------- let's begin -------------------------- //

var defaults = {
  tumblrOauthFile: '_tumblr-oauth.yml'
};

var options = _.extend( defaults, {} );

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;
var tumblrOauthFilePath = path.resolve( process.cwd(), options.tumblrOauthFile );
var oauthFileExists = existsSync( tumblrOauthFilePath );
// local vars
var oauthFile, oauthKeys, auth, oauthToken, oauthSecret, router;


module.exports.auth = function authorize() {

  if ( !oauthFileExists ) {
    logError( 'Tumblr OAuth file "' + options.tumblrOauthFile +'" not found' );
    return;
  }

  oauthFile = fs.readFileSync( tumblrOauthFilePath, 'utf8' );
  oauthKeys = yaml.load( oauthFile );

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

  auth = new OAuth(
    'http://www.tumblr.com/oauth/request_token',
    'http://www.tumblr.com/oauth/access_token',
    oauthKeys.consumerKey,
    oauthKeys.consumerSecret,
    '1.0A', '/complete', 'HMAC-SHA1'
  );

  // simple server for OAuth dance
  router = new Router();

  router.get( '/complete', handleComplete );

  auth.getOAuthRequestToken( function( err, token, secret, results ) {
    if ( err ) {
      logError( 'Unable to get OAuth request token. ' + err.data );
      return;
    }

    oauthToken = token;
    oauthSecret = secret;

    // start server
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
  var pageContent;

  // no verifier, OAuth failed or was denied
  if ( !verifier ) {
    logError('OAuth denied');
    pageContent = fs.readFileSync( './views/oauth-denied.mustache', 'utf8' );
    displayPage( response, {
      yield: pageContent
    });
    // end page
    request.connection.destroy();
    router.server.close();
    return;
  }

  var onOauthAccessGet = function( error, accessToken, accessSecret, results ) {
    if ( error ) {
      logError( 'Unable to get OAuth access. ' + error.data );
      return;
    }
    // server confirmation page
    console.log( 'OAuth complete'.green );

    displayPage( response, {
      yield: successCompiled.render({ path: options.tumblrOauthFile })
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
  var content = 'consumerKey: ' + oauthKeys.consumerKey + "\n" +
    'consumerSecret: ' + oauthKeys.consumerSecret + "\n" +
    'accessToken: ' + accessToken + "\n" +
    'accessSecret: ' + accessSecret  + "\n";
  fs.writeFile( options.tumblrOauthFile, content, 'utf8', function() {
    console.log('Tumblr keys updated');
  });
}

