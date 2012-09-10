/*jshint devel: true, node: true */

"use strict";

var fs = require('fs');
var Router = require('./router');
var hogan = require("hogan.js");
var router = new Router();

router.get( '/foo', function( request, response ) {
  response.html('this is foo');
});

var messageTemplate = fs.readFileSync( './views/message.mustache', 'utf8' );
// compile with hogan
var messageCompiled = hogan.compile( messageTemplate );

// displays the message template with content from another file
function displayPage( response, context ) {
  // var content = fs.readFileSync( './views/' + contentFile, 'utf8' );
  var html = messageCompiled.render( context );
  response.html( html );
}

router.get( '/message', function( request, response ) {
  displayPage( response, {
    yield: 'THis is my favorite message'
  });
});

router.server.listen(8080);