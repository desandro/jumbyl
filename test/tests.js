/*jshint devel: true, node: true */

'use strict';

// -------------------------- modules -------------------------- //

var assert = require('assert');
var should = require('should');
var fs = require('fs');

var jumbyl = require('../lib/jumbyl');

// -------------------------- tests -------------------------- //

// console.log( jumbyl );

// var config = jumbyl.getConfig()
// console.log( config );

// jumbyl.auth();

// Will pass
// assert.ok(true);

// Will throw an exception
// assert.ok(false);

// jumbyl.post('test/dummy/command-file-double-click.mdown')


// -------------------------- getFileParts -------------------------- //

// no-yaml.mdown has a `---` but does not have actual YAML
var fileParts;
var noYamlFilePath = 'test/dummy/no-yaml.mdown';

// test for file that's not there
fileParts = jumbyl.getFileParts('foo');
fileParts.should.not.be.ok;

fileParts = jumbyl.getFileParts( noYamlFilePath );
fileParts.should.not.have.property('frontMatter');
fileParts.should.have.property('content');
// content should match actual file contents
var noYamlContent = fs.readFileSync( noYamlFilePath, 'utf8' );
fileParts.content.should.equal( noYamlContent );

fileParts = jumbyl.getFileParts('test/dummy/animals.mdown');
fileParts.content.should.equal("My favorite is a lion.\n---\nNot a bear.\n")
// console.log( fileParts.frontMatter );
fileParts.frontMatter.should.equal("\nlion: barbary\ntiger: siberian\nbear: grizzly\n")

