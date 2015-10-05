var generators = require('yeoman-generator');
var _ = require('underscore.string');
var path = require('path');
var genUtils = require('../util.js');
var htmlWiring = require('html-wiring');

var ServicenowReactComponentGenerator = generators.NamedBase.extend({
	init: function(){
		this.name = _.capitalize(_.camelize(_.slugify(_.humanize(this.name))));
	},

	getConfigData: function () {
		this.filters = this.config.get('filters');
	},

	generate: function() {
		this.sourceRoot(path.join(__dirname, './templates'));
		var dest = 'app/react_components/' + this.name;
		genUtils.processDirectory(this, '.', dest);
	},

	modifyIndex: function(){
		indexFilePath = './app/index.html';
		file   = htmlWiring.readFileAsString(indexFilePath);
		componentHook = "<!-- React Components -->";
		componentHtml = '\t\t\t\t' + '<div class="col-md-4" style="background-color: #fafafa; text-align: center; padding: 10px 10px 10px 10px; border: 5px solid white">' + '\n\t' +
			'\t\t\t\t' + '<a href="./react_components/' + this.name + '"><div style="font-size: x-large">' + this.name + '</div></a>' + '\n' +
			'\t\t\t\t' + '</div>';
		this.write(indexFilePath, file.replace(componentHook, componentHook + '\n' + componentHtml));
	}
});

module.exports = ServicenowReactComponentGenerator;