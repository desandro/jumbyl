
var _ = require('underscore');

var jumbyl = {};



jumbyl = _.extend( jumbyl, require('./auth') );
jumbyl = _.extend( jumbyl, require('./post') );

// make available
module.exports = jumbyl;
