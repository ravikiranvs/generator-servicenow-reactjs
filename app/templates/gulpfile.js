'use strict';
/**************************************Dependencies*************************************/
var gulp = require('gulp'); //Main Gulp Lib
var gulpConnect = require('gulp-connect'); //Creates web server
var webserver = require('gulp-webserver'); //Creates web server
var gulpOpen = require('gulp-open'); //Open URL in browser
var browserify = require('gulp-browserify'); //For requiring modules
var reactify = require('reactify'); //jsx to js transtormer
var source = require('vinyl-source-stream'); //text stream
var rename = require('gulp-rename'); //rename files
var glob = require('glob'); //Get multiple files from wildcard
var es = require('event-stream'); //combine events
var clean = require('gulp-clean'); //deletes files and directories
var uglify = require('gulp-uglify'); //minify js
var configReader = require('config'); //reads external config file
var snUploader = require('./gulp-servicenow-uploader'); //uploads js files to servicenow
var karmaServer = require('karma').Server; //Unit test runner
/**************************************Section End**************************************/


/*************************************Configurations************************************/
var config = {
	paths:{
		source: {
			indexHTML: './app/index.html',
			jsx: './app/react_components/**/*.jsx',
			testJsx: './app/react_components/**/__tests__/*.jsx',
			html: './app/react_components/**/*.html',
			css: './app/react_components/**/*.css',
			js: './app/react_components/**/*.js',
			reactComponents: './app/react_components/**',
			bowerComponents: './app/bower_components/**/**/**/*'
		},
		dest: {
			dest: './dest',
			app: './dest/app',
			reactComponents: './dest/app/react_components',
			bowerComponents: './dest/app/bower_components',
			jsx: './dest/app/react_components/**/*.jsx',
			testJs: './dest/app/react_components/**/*.test.bundle.js',
			js: './dest/app/react_components/**/*.js',
			serve: 'dest\\app'
		}
	}
}
/**************************************Section End**************************************/



//Main gulp task
gulp.task('default', ['serve:debug', 'watch']);

//Watch for file changes and build and refresh page.
gulp.task('watch', ['cleanUpBuild'], function() {
	gulp.watch(config.paths.source.indexHTML, ['changeMainPage']);
	gulp.watch(config.paths.source.jsx, ['changeJSX']);
	gulp.watch(config.paths.source.css, ['changeCSS']);
	gulp.watch(config.paths.source.html, ['changeHTML']);
});
gulp.task('changeMainPage', function (done) {
	gulp.src(config.paths.source.indexHTML)
		.pipe(gulp.dest(config.paths.dest.app))
		.on('end', done);
});
gulp.task('changeJSX',['jsx'] , function (done) {
	gulp.src(config.paths.source.js)
		.pipe(gulp.dest(config.paths.dest.reactComponents))
		.on('end', done);
});
gulp.task('changeCSS', function (done) {
	gulp.src(config.paths.source.css)
		.pipe(gulp.dest(config.paths.dest.reactComponents))
		.on('end', done);
});
gulp.task('changeHTML', function (done) {
	gulp.src(config.paths.source.html)
		.pipe(gulp.dest(config.paths.dest.reactComponents))
		.on('end', done);
});

//Serve dest files
gulp.task('serve', ['compress'], function(done) {
	gulp.src(config.paths.dest.serve).pipe(webserver({
		livereload: true,
		fallback: 'index.html',
		open: true
	}));
});

gulp.task('serve:debug', ['cleanUpBuild'], function(done) {
	gulp.src(config.paths.dest.serve).pipe(webserver({
		livereload: true,
		fallback: 'index.html',
		open: true
	}));
});

gulp.task('clean', function () {
	gulp.src(config.paths.dest.dest)
		.pipe(clean());
});

//Move files temp
gulp.task('moveToDest', ['moveMainPageToDest'], function (done) {
	setTimeout(done, 100);
});
gulp.task('moveMainPageToDest', ['moveReactComponentsToDest'], function (done) {
	gulp.src(config.paths.source.indexHTML)
		.pipe(gulp.dest(config.paths.dest.app))
		.on('end', function(){ setTimeout(done, 100); });
});

gulp.task('moveReactComponentsToDest', ['moveBowerComponentsToDest'], function (done) {
	gulp.src(config.paths.source.reactComponents)
		.pipe(gulp.dest(config.paths.dest.reactComponents))
		.on('end', function(){ setTimeout(done, 100); });
});

gulp.task('moveBowerComponentsToDest', ['clean', 'jsx'], function (done) {
	gulp.src(config.paths.source.bowerComponents)
		.pipe(gulp.dest(config.paths.dest.bowerComponents))
		.on('end', function(){ setTimeout(done, 100); });
});

//JSX task
gulp.task('jsx', function(done) {
	glob(config.paths.source.jsx, function(err, files) {
		if(err) done(err);
		var tasks = files.map(function(entry) {
			return gulp.src(entry, { read: false })
				.pipe(browserify({
					transform: 'reactify',
					extensions: ['.jsx']
				}))
				.pipe(rename({
			    	extname: '.bundle.js'
				}))
				.pipe(gulp.dest( entry.substr(0,entry.lastIndexOf('/')) ));
		});

		if(tasks.length > 0)
			es.merge(tasks).on('end', done);
		else
			done();
	});
});

gulp.task('jsxTest', function(done) {
	glob(config.paths.source.testJsx, function(err, files) {
		if(err) done(err);
		var tasks = files.map(function(entry) {
			return gulp.src(entry, { read: false })
				.pipe(browserify({
					transform: 'reactify',
					extensions: ['.jsx']
				}))
				.pipe(rename({
			    	extname: '.bundle.js'
				}))
				.pipe(gulp.dest( entry.substr(0,entry.lastIndexOf('/')) ));
		});

		if(tasks.length > 0)
			es.merge(tasks).on('end', done);
		else
			done();
	});
});

gulp.task('cleanUpBuild', ['moveToDest'], function (done) {
	var task1 = gulp.src(config.paths.dest.testJs)
		.pipe(clean());
	var task2 = gulp.src(config.paths.dest.jsx)
		.pipe(clean());

	es.merge([task1, task2]).on('end', function(){ setTimeout(done, 100); });
});

gulp.task('compress', ['cleanUpBuild'], function(done) {
  return gulp.src(config.paths.dest.js)
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.dest.reactComponents));
});

gulp.task('deploy', ['compress'], function(){
	var snConfig = configReader.get('servicenow');
	
	gulp.src(config.paths.dest.js)
		.pipe(snUploader(snConfig));
});

gulp.task('test', ['jsxTest'], function(done){
	new karmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, function(){done();}).start();
});