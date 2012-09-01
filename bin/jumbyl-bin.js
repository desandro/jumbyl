#!/usr/bin/env node

var nopt = require('nopt');

var parsedOpts = nopt( {}, {}, process.argv );

// console.log( 'yo I am in a bin', process.argv, parsedOpts );
console.log( process.cwd() );
