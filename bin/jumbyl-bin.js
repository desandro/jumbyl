#!/usr/bin/env node

// var jumbyl = require('../lib/jumbyl');
var jumbyl = require('/Users/dave/projects/jumbyl/lib/jumbyl');

// get command line arguments
var args = process.argv.slice(2);
var arg = args[0];

// `jumbyl auth` or `jumbyl test`
// trigger method if there
if ( jumbyl[ arg ] ) {
  jumbyl[ arg ]();
  return;
}

// otherwise post file
jumbyl.post( arg );
