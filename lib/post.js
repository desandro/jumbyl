
// -------------------------- dependencies -------------------------- //

var fs = require('fs');
var colors = require('colors');
var path = require('path');

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

module.exports.post = function( filePath ) {
  // resolve file path
  filePath = path.resolve( process.cwd(), filePath );
  
  console.log( existsSync( filePath ) );

};


