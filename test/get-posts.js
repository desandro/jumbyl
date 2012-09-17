

// check Tumblr API is working

var jumbyl = require('../lib/jumbyl');
var Tumblr = require('tumblrwks');

var config = jumbyl.getConfig();

var blog = new Tumblr( config, config.baseHostname );

blog.get( '/posts', { hostname: config.baseHostname, limit: 10 }, function( data ) {
  console.log( data );
});
