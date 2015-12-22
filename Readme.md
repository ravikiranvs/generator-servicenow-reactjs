#Yeoman generator for creating react.js components for ServiceNow
##What is servicenow-reactjs
[ServiceNow](http://www.servicenow.com/) is a great platfrom for building applications for `Service Management`. 
But we found it to be lacking some features for web development that we have become accustomed to:

1. A way to develop solutions locally in an Text Editor / IDE of our choice.
2. Cannot write and run unit tests for JavaScript.
3. Using a source control like GIT.
4. Have a build process: Compress JavaScript and CSS, Unit Test and Deploy into ServiceNow.
5. Making the code re-usable. HTML is tightly coupled with JS and we would like to include the HTML along with JS into the `UI Scripts` table as well.

We created servicenow-reactjs as a way to fill this gap.
 
`servicenow-reactjs` is a yeoman generator that provides a simple way for creating [reusable components](https://facebook.github.io/react/docs/reusable-components.html) for ServiceNow using the `react.js` framework.

###Features provided in servicenow-reactjs:
* Run your ServiceNow solution locally. With this you can use a Text Editor / IDE of your choice, use GIT for source control.
* Live Reload of code changes on browser. As soon as you save your code changes the local browser reloads with the changes.
* Run Tests on your JS using Karma
* We have used Gulp to create tasks to compress and deploy JS and CSS to ServiceNow.
* react.js enforces us to combine HTML into JS thus we can have the re-usable scripts in `UI Scripts` table.

##How to install
Install `yo`, `gulp-cli`, `bower`, and `generator-servicenow-reactjs`
```
$ npm install -g yo gulp-cli bower generator-servicenow-reactjs
```
##Using the generator
###Creating a project for your components
```
$ yo servicenow-reactjs [AppName]
```
###Creating a component
```
$ yo servicenow-reactjs:component [ComponentName]
```
###Folder Structure
```
.
├── /app/                                       # All of our app specific components go in here
│   ├── /bower_components/                      # 3rd-party bower libraries and utilities
│   ├── /css/                                   # Contains bundled css from all the created components
│   ├── /react_components/                      # Reusable react.js components
│   │   └── /[ComponentName]/                   # Folder created to store all resources related to a component
│   │       ├── /__tests__/                     # Contains test cases for the component
│   │       │   └── /[ComponentName].test.jsx   # File containing the tests
│   │       ├── /[ComponentName].css            # CSS for the component
│   │       ├── /[ComponentName].jsx            # Reusable JSX for the react.js component 
│   │       ├── /[ComponentName].data.js        # Mock data for the component
│   │       ├── /[ComponentName].render.jsx     # JSX for rendering the reusable component
│   │       └── /index.html                     # Page already setup with the react.js component
│   └── /index.html                             # Home page showing a list of all the components developed
├── /config/                                    # Folder containing servicenow configuration
│   └── /default.json                           # File containing servicenow configuration
├── /dest/                                      # The folder for compiled output
├── /node_modules/                              # 3rd-party npm libraries and utilities
├── /.bowerrc                                   # Specifies the folder for 3rd-party bower libraries and utilities 
├── /.gitignore                                 # Specifies the folder/files for git to ignore
├── /bower.json                                 # The list of bower 3rd party libraries and utilities
├── /gulp-servicenow-uploader.js                # Utility for deploying JS and CSS to ServiceNow
├── /gulpfile.js                                # Has tasks for build / test / run / deploy
├── /karma.conf.js                              # Configuration for running the tests
└── /package.json                               # The list of npm 3rd party libraries and utilities
```
##Working with ServiceNow Jelly (Using your deployed component in ServiceNow)
Writing Jelly still needs to be done in a ServiceNow instance.

The data from the Jelly should to be serialized to JSON:
```
var json = new JSON();
var jsonData = json.encode(data);
```
The JSON can then be mocked by copying it into the file `ComponentName`.data.js

###Sample Jelly which sets up a react.js component:
```
<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<div id="ComponentName"></div>
	<g:evaluate>
		var hwItemArray = [];
		
		var hwItem = new GlideRecord('sc_cat_item');
		hwItem.addQuery('category.title', 'Hardware');
		hwItem.query();
		while(hwItem.hasNext()){
			hwItem.next();
			var hwObj = {};
		
			hwObj.id = hwItem.sys_id.getDisplayValue();
			hwObj.name = hwItem.name.getDisplayValue();
			hwObj.description = hwItem.description.getDisplayValue();
			hwObj.image = hwItem.picture.getDisplayValue();
			hwObj.price = hwItem.price.getDisplayValue();
			hwObj.vendor = hwItem.vendor.getDisplayValue();
		
			hwItemArray.push(hwObj);
		}

		var json = new JSON();
		var hwCatJSON = json.encode(hwItemArray);
	</g:evaluate>
	<script>
		var data = ${hwCatJSON};
	</script>
	<script language="javascript" src="ComponentName.render.bundle.js.jsdbx" />
</j:jelly>
``` 
##Testing
Tests for each component needs to be in the `ComponentName`.test.jsx file.

To Run the tests:
```
$ gulp test
```
##Deploying to ServiceNow
* The JS files are copied into the `UI Scripts` table.
* All the CSS files are bundled and copied into the `Style Sheet` table

```
$ gulp deploy
```