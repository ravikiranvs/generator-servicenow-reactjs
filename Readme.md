#Yeoman generator for creating react.js components for ServiceNow

##What is servicenow-reactjs
The servicenow-reactjs generator provides a simple way for creating reusable components for ServiceNow using the react.js framework.

ServiceNow is a great platfrom for building applications for Service Management however we found that the development process isn't streamlined:

1. There is no IDE.
2. There is a place to store reusable JavaScript but not for HTML which goes along with it. The problem comes while changing the reusable script, we are not sure of all the places it is being used.
3. Cannot write and run unit tests.
4. Source control like GIT.
5. Have a build process: Compress, Test and Deploy

###Features provided in servicenow-reactjs:
* Live Reload of code cahnges on browser
* Run Tests using Karma
* Gulp tasks to compress and deploy the components to ServiceNow
* Use GIT for source control instead of relying on ServiceNow

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
│   ├── /css/                                   # Contains bundeled css from all the created components
│   ├── /react_components/                      # Reusable react.js components
│   │   └── /ComponentName/                     # Folder cerated to store all resources related to a component
│   │       ├── /__tests__/                     # Contains test cases for the component
│   │       │   └── /ComponentName.test.jsx     # File containing the tests
│   │       ├── /ComponentName.css              # CSS for the component
│   │       ├── /ComponentName.jsx              # Reusable JSX for the react.js component 
│   │       ├── /ComponentName.data.js          # Mock data for the component
│   │       ├── /ComponentName.render.jsx       # JSX for rendering the reusable component
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
##Working with servicenow Jelly
Writing Jelly still needs to be done in a servicenow instance.

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
* All the CSS files are bundled and copyed into the `Style Sheet` table

```
$ gulp deploy
```