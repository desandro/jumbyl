/*jshint devel: true, node: true */

"use strict";

var Router = require('./router');
var router = new Router();

router.get( '/foo', function( request, response ) {
  response.html('this is foo');
});

router.server.listen(8080);