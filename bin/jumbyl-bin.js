#!/usr/bin/env node

var jumbyl = require('../lib/jumbyl');

// get command line arguments
var args = process.argv.slice(2);

// if `jumbyl auth`
if ( args[0] === 'auth' ) {
  jumbyl.auth();
  return;
}

// otherwise post file
jumbyl.post( args[0] );
