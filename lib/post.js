/*jshint devel: true, node: true */

'use strict';

// -------------------------- dependencies -------------------------- //

var fs = require('fs');
var colors = require('colors');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('underscore');
var Tumblr = require('tumblrwks');

var jumbyl = require('./jumbyl');

// --------------------------  -------------------------- //

// hash of content param name
var contentParamNames = {
  link: 'description',
  chat: 'conversation',
  quote: 'quote',
  photo: 'caption',
  audio: 'caption',
  video: 'caption'
};

// -------------------------- getTumblrPost -------------------------- //

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

// extract YAML Front Matter from file
/**
 * @returns {Object} post : with...
 *   {String} content : content of the post, after any YAML Front Matter
 *   {String} frontMatter : YAML Front Matter
 *   {Object} data : YAML Front Matter parsed as JS object
**/

function parsePostFile( filePath ) {
  // resolve file path
  var resolvedFilePath = path.resolve( process.cwd(), filePath );

  if ( !existsSync( resolvedFilePath ) ) {
    console.log( ( 'File not found: ' + filePath ).red );
    return false;
  }

  var post = {};
  // file/path data
  post.basename = path.basename( resolvedFilePath );
  post.extname = path.extname( post.basename );

  var file = fs.readFileSync( resolvedFilePath, 'utf8' );

  // check if file begins with `---`, if so split file with `---`
  var dashedSplit = file.indexOf('---') === 0 && file.split('---');
  post.content = file;

  // parse YAML from post
  if ( dashedSplit && dashedSplit.length ) {
    // remove first item, empty
    dashedSplit.splice( 0, 1 );
    // front matter comes after the first split
    post.frontMatter = dashedSplit.splice( 0, 1 )[0];
    // parse front matter as YAML
    post.data = yaml.load( post.frontMatter );
    // remove initial line break from first item
    dashedSplit[0] = dashedSplit[0].replace( /^\n/, '' );
    // content is everything else
    post.content = dashedSplit.join('---');
  }

  return post;
}

module.exports.parsePostFile = parsePostFile;

// -------------------------- getTumblrParams -------------------------- //

/**
 * @param {Object} post : post object provided by parsePostFile()
 * @returns {Object} params : post paramater object ready to be used in tumblrwks.post()
**/
function getTumblrParams( post ) {
  var params = post.data && _.clone( post.data ) || {};

  // apply content to parameters
  if ( post.content ) {
    // different post types use different parameter names for content
    // default to 'body' for text posts
    var contentParamName = ( params.type && contentParamNames[ params.type ] ) || 'body';
    params[ contentParamName ] = post.content;
  }

  // concatenate tags
  if ( params.tags && _.isArray( params.tags ) ) {
    params.tags = params.tags.join(',');
  }

  // munge format for markdown
  switch ( post.extname ) {
    case '.md' :
    case '.mdown' :
    case '.markdown' :
    case '.mkdn' :
      // format is markdown, but don't overwrite if already specified
      params.format = params.format || 'markdown'
      break;
  }

  return params;
}

module.exports.getTumblrParams = getTumblrParams;

// -------------------------- post -------------------------- //

module.exports.post = function( filePath ) {
  if ( !filePath ) {
    console.log( 'Please provide a file.'.red );
    return;
  }

  var config = jumbyl.getConfig();
  if ( !config || !config.baseHostname ) {
    console.log( 'Incomplete config'.red );
    return;
  }

  var blog = new Tumblr( config, config.baseHostname );
  var post = parsePostFile( filePath );
  var params = getTumblrParams( post );

  // edit post if id is present
  var url = params.id ? '/post/edit' : '/post';

  blog.post( url, params, function( response ) {
    console.log( 'Post created! Post id: ' + response.green );
    console.log( response );
  });

};
