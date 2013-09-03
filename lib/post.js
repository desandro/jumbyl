/*jshint devel: true, node: true */

'use strict';

// -------------------------- dependencies -------------------------- //

var fs = require('fs');
var colors = require('colors');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('underscore');
// var Tumblr = require('tumblrwks');
var tumblr = require('tumblr.js');

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
resolvedFilePath
file
**/

function parsePostFile( filePath ) {
  var post = {};
  // resolve file path
  post.resolvedFilePath = path.resolve( process.cwd(), filePath );

  if ( !existsSync( post.resolvedFilePath ) ) {
    console.log( ( 'File not found: ' + filePath ).red );
    return false;
  }

  // file/path data
  post.basename = path.basename( post.resolvedFilePath );
  post.extname = path.extname( post.basename );
  post.file = fs.readFileSync( post.resolvedFilePath, 'utf8' );

  // check if file begins with `---`, if so split file with `---`
  var dashedSplit = post.file.indexOf('---') === 0 && post.file.split('---');
  post.content = post.file;

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

  // munge ._url to .url for link posts
  if ( post.data._url ) {
    params.url = post.data._url;
  }

  // munge format for markdown
  switch ( post.extname ) {
    case '.md' :
    case '.mdown' :
    case '.markdown' :
    case '.mkdn' :
      // format is markdown, but don't overwrite if already specified
      params.format = params.format || 'markdown';
      break;
  }

  return params;
}

module.exports.getTumblrParams = getTumblrParams;

// -------------------------- writeId -------------------------- //

// writes id to YAML front matter of post
function writeId( id, post ) {
  var file;
  // use quotes so JS doesn't munge the interger weirdly
  var idLine = "id: '" + id + "'\n";
  if ( post.frontMatter && post.data && post.data.id ) {
    // file already id, just replace it with new one
    file = post.file.replace( /\nid:.+\n/, '\n' + idLine );
  } else {
    // add id
    file = '---' + ( post.frontMatter || '\n' );
    file += idLine;
    file += '---\n';
    file += post.content;
  }
  fs.writeFileSync( post.resolvedFilePath, file, 'utf8' );
}

module.exports.writeId = writeId;

// -------------------------- post -------------------------- //

module.exports.post = function( filePath ) {
  if ( !filePath ) {
    console.log( 'Please provide a file.'.red );
    return;
  }

  var config = jumbyl.getConfig();
  if ( !config || !config.base_hostname ) {
    console.log( 'Incomplete config'.red );
    return;
  }

  var client = new tumblr.Client( config );

  var post = parsePostFile( filePath );
  var params = getTumblrParams( post );

  // edit post if id is present
  // var isNew = !params.id;
  // var url = isNew ? '/post' : '/post/edit';

  var method = params.type || 'text';
  client[ method ]( config.base_hostname, params, function( err, data ) {
    if ( err ) {
      console.log( err );
      return;
    }
    // var action = isNew ? 'created' : 'edited';

    console.log( err, data );
    writeId( data.id, post );
    console.log( 'Post created! Post id: ' + ( data.id + '' ).green );
  });

};
