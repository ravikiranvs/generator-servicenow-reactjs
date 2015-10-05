var generators = require('yeoman-generator');
var _ = require('underscore.string');
var path = require('path');
var genUtils = require('../util.js');

var ServicenowReactGenerator = generators.Base.extend({

	init: function () {
		this.argument('name', { type: String, required: false });
		this.appname = this.name || path.basename(process.cwd());
		this.appname = _.camelize(_.slugify(_.humanize(this.appname)));

		this.filters = {};
	},

	info: function () {
		this.log('I help in creating react.js components for servicenow and in deployment to UI Scripts. \n');
	},

	userPrompts: function(){
		var cb = this.async();

		this.prompt([{
			type: "confirm",
			name: "bootstrap",
			message: "Would you like to include Bootstrap?"
		},{
			type: "input",
			name: "servicenowUrl",
			message: "Please enter the URL of your servicenow instance:"
		},{
			type: "input",
			name: "servicenowUserName",
			message: "Please enter the username of your servicenow instance:"
		},{
			type: "input",
			name: "servicenowPassword",
			message: "Please enter the password of your servicenow instance:"
		}], function (answers) {
			this.filters.bootstrap = !!answers.bootstrap;
			this.filters.servicenow = {};
			this.filters.servicenow.Url = _.camelize(_.slugify(_.humanize(answers.servicenowUrl)));
			this.filters.servicenow.UserName = _.camelize(_.slugify(_.humanize(answers.servicenowUserName)));
			this.filters.servicenow.Password = _.camelize(_.slugify(_.humanize(answers.servicenowPassword)));
			cb();
		}.bind(this));
	},

	saveSettings: function () {
		this.config.set('filters', this.filters);
		this.config.forceSave();
	},

	generate: function() {
		this.sourceRoot(path.join(__dirname, './templates'));
		genUtils.processDirectory(this, '.', '.');
	},

	end: function() {
		this.installDependencies({
			skipInstall: this.options['skip-install']
		});
	}
});

module.exports = ServicenowReactGenerator;