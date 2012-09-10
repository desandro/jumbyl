/*jshint devel: true, node: true */

"use strict";

var http = require('http');
var url = require("url");

// -------------------------- Router -------------------------- //

function Router() {
  // HTTP verb
  this.routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
    HEAD: {}
  };

  this.server = http.createServer( this.listener.bind( this ) );

}

Router.prototype.listener = function( request, response ) {
  // console.log( url.parse( request.url ) );
  // i.e. "GET" or "POST"
  var method = this.routes[ request.method ];
  var pathname = url.parse( request.url ).pathname;
  var handler = method && method[ pathname ];
  if ( !handler ) {
    console.log('no handler');
    response.end();
    return;
  }
  handler( request, response );
  response.end();
};

// register handler for GET for path
Router.prototype.get = function( path, handler ) {
  this.routes.GET[ path ] = handler;
};

// Router.prototype.simpleHtml = function( response, body ) {
// };

module.exports = Router;

// -------------------------- HTTP response -------------------------- //

http.ServerResponse.prototype.html = function( body ) {
  this.writeHead( 200, {
    'Content-Type': 'text/html',
    "Content-Length": Buffer.byteLength( body, 'utf8' )
  });
  this.end( body, 'utf8' );
};
