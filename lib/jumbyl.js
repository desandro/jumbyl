
var _ = require('underscore');

var jumbyl = {};
// make available
module.exports = jumbyl;

jumbyl = _.extend( jumbyl, require('./get-config') );
jumbyl = _.extend( jumbyl, require('./auth') );
jumbyl = _.extend( jumbyl, require('./post') );


