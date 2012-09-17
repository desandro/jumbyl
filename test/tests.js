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


// -------------------------- parsePostFile -------------------------- //

var post;
// no-yaml.mdown has a `---` but does not have actual YAML
var noYamlFilePath = 'test/dummy/no-yaml.mdown';

// test for file that's not there
post = jumbyl.parsePostFile('foo');
post.should.not.be.ok;

post = jumbyl.parsePostFile( noYamlFilePath );
post.should.not.have.property('frontMatter');
post.should.have.property('content');
// content should match actual file contents
var noYamlContent = fs.readFileSync( noYamlFilePath, 'utf8' );
post.content.should.equal( noYamlContent );

// test file with YAML front matter
post = jumbyl.parsePostFile('test/dummy/animals.mdown');
post.basename.should.equal('animals.mdown');
post.extname.should.equal('.mdown');
post.content.should.equal('My favorite is a lion.\n---\nNot a bear.\n');
post.frontMatter.should.equal('\nlion: barbary\ntiger: siberian\nbear: grizzly\n');
post.data.lion.should.equal('barbary');
post.data.tiger.should.equal('siberian');
post.data.bear.should.equal('grizzly');

// -------------------------- getTumblrParams -------------------------- //

// test munging of post YAML into what Tumblr uses
post = jumbyl.parsePostFile('test/dummy/paper-rad.mdown');
var params = jumbyl.getTumblrParams( post );
params.description.should.equal('Pretty awesome site\n');
params.tags.should.equal('illustration,animation,Ben Jones');
params.format.should.equal('markdown');

// -------------------------- writeId -------------------------- //

// adds id to the post file
jumbyl.writeId( '12345', post );
post = jumbyl.parsePostFile('test/dummy/paper-rad.mdown');
post.data.id.should.equal('12345');
// reset file
fs.writeFile( post.resolvedFilePath, post.file.replace( /\nid:.+\n/, '\n' ) );

// -------------------------- post -------------------------- //

// jumbyl.post('test/dummy/paper-rad.mdown');
