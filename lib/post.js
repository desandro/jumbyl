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

// extract YAML Front Matter from file
/**
 * @returns {Object} parts : with .frontMatter and .content
**/

function getFileParts( filePath ) {
  // resolve file path
  var resolvedFilePath = path.resolve( process.cwd(), filePath );

  if ( !existsSync( resolvedFilePath ) ) {
    console.log( ( 'File not found: ' + filePath ).red );
    return false;
  }

  var parts = {};
  var file = fs.readFileSync( resolvedFilePath, 'utf8' );

  // check if file begins with `---`, if so split file with `---`
  var dashedSplit = file.indexOf('---') === 0 && file.split('---');
  parts.content = file;

  // parse YAML from post
  if ( dashedSplit && dashedSplit.length ) {
    // remove first item, empty
    dashedSplit.splice( 0, 1 );
    // front matter comes after the first split
    parts.frontMatter = dashedSplit.splice( 0, 1 )[0];
    // remove initial line break from first item
    dashedSplit[0] = dashedSplit[0].replace( /^\n/, '' );
    // content is everything else
    parts.content = dashedSplit.join('---');
  }

  return parts;

}

module.exports.getFileParts = getFileParts;

// get 
// @returns {Object}:
//  { content: [String], frontMatter: [String], params: [Object] }
function getTumblrPost( filePath ) {



  var post = fs.readFileSync( filePath, 'utf8' );
  // extract YAML Front Matter from post
  var dashedSplit = post.indexOf('---') === 0 && post.split('---');
  var content = post;
  var params = {};
  var frontMatter;
  // parse YAML from post
  if ( dashedSplit && dashedSplit.length ) {
    frontMatter = dashedSplit[1];
    content = dashedSplit[2];
    params = yaml.load( frontMatter );
  }

  // apply defaults
  // var params = _.extend( {}, defaultParams, postOptions );

  // apply content to parameters
  if ( content ) {
    var contentParamName = contentParamNames[ params.type ] || 'body';
    params[ contentParamName ] = content;
  }

  // concatenate tags
  if ( params.tags && _.isArray( params.tags ) ) {
    params.tags = params.tags.join(',');
  }

  return {
    content: content,
    frontMatter: frontMatter,
    params: params
  };
}



// -------------------------- post -------------------------- //

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

module.exports.post = function( filePath ) {
  var config = jumbyl.getConfig();
  var blog = new Tumblr( config, config.baseHostname );
  var tumblrPost = getTumblrPost( filePath );

  // edit post if id is present
  var url = tumblrPost.params.id ? '/post/edit' : '/post';

  blog.post( '/post', tumblrPost.params, function( data ) {
    console.log( 'Post created! Post id: ' + data.green );
  });

};


