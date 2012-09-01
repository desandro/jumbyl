var fs = require('fs');
var colors = require('colors');
var path = require('path');
var _ = require('underscore');
var OAuth = require('oauth').OAuth;
var yaml = require('js-yaml');
var router = require('./node-router');

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

if ( !oauthKeys.consumer_key || !oauthKeys.consumer_key ) {
  if ( !oauthKeys.consumer_key ) {
    logError('Missing OAuth consumer key from ' + options.tumblrOauthFile );
  }
  if ( !oauthKeys.consumer_secret ) {
    logError('Missing OAuth consumer secret from ' + options.tumblrOauthFile );
  }
  return;
}

var auth = new OAuth(
  'http://www.tumblr.com/oauth/request_token',
  'http://www.tumblr.com/oauth/access_token',
  oauthKeys.consumer_key,
  oauthKeys.consumer_secret,
  '1.0A', '/oauthed', 'HMAC-SHA1'
);

var oauthToken, oauthSecret;

auth.getOAuthRequestToken( function( err, token, secret, results ) {
  if ( err ) {
    logError( 'Unable to get OAuth request token. ' + err.data );
    return;
  }

  oauthToken = token;
  oauthSecret = secret;
  oauthDance();
  // console.log( token, secret );
  // res.redirect( 'http://www.tumblr.com/oauth/authorize?oauth_token=' + requestToken );
});


// simple server for OAuth dance
var server;

function oauthDance() {
  server = router.getServer();
  // initial URL just redirects to Tumblr OAuth authorization page
  server.get( '/', function( request, response ) {
    response.redirect( 'http://www.tumblr.com/oauth/authorize?oauth_token=' + requestToken );
  });

  server.get( '/oauthed', gotOauthed );
  server.listen('8080')
}

function gotOauthed( request, response ) {
  // get access token
  auth.getOAuthAccessToken( oauthToken, oauthSecret, request.query.oauth_verifier, onOauthAccessGet );
}

function onOauthAccessGet( error, accessToken, accessSecret, results ) {
  if ( error ) {
    logError('Unable to get OAuth access' + error.data );
    return;
  }
  response.simpleHtml( 200, oauth_access_token + ' :: ' + oauth_access_token_secret )
}

