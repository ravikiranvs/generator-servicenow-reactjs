// child_process is used to spawn the scss-lint binary
//var child_process = require('child_process');

// map-stream is used to create a stream that runs an async function
var map = require('map-stream');
// gulp-util is used to created well-formed plugin errors
//var gutil = require('gulp-util');

fs = require('fs');
request = require('request');

function ServiceNowFile(file) {
  this.file = file;
  this.filePath = file.path;
  this.filename = this.filePath.substr(this.filePath.lastIndexOf('\\') + 1 , this.filePath.length);
  this.fileData = "";
  this.sys_id = "";
};

ServiceNowFile.prototype.readFile = function (callback) {
   fs.readFile(this.filePath, 'utf8', function (err,data) {
      if (err) {
         callback(err);
      }
      callback(data);
   });
};

ServiceNowFile.prototype.checkIfFileExistsInSN = function (options, callback) {
   var auth = new Buffer(options.username + ":" + options.password).toString("base64");
   var reqOptions = {
      url: options.url + '/api/now/table/' + options.Table + '?name=' + this.filename,
      method: 'GET',
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': ("Basic " + auth)
      }
   };

   request(reqOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         body = JSON.parse(body);
         callback(true, body);
      }
      else if(response.statusCode == 404){
         callback(false, null);
      }
      else{
         //handle error...
      }
   });
};

ServiceNowFile.prototype.uploadToSN = function (isNotNew, options, callback) {
   var auth = new Buffer(options.username + ":" + options.password).toString("base64");
   
   var reqContent = {};
   if(options.Table == 'sys_ui_script'){
         reqContent.global = "false";
         reqContent.script = this.fileData;
         reqContent.description = "";
         reqContent.active = "true";
         reqContent.name = this.filename;
   }
   else if(options.Table == 'content_css'){
         reqContent.name = this.filename;
         reqContent.type = "local";
         reqContent.style = this.fileData;
   }
   
   var reqOptions = {
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': ("Basic " + auth)
      },
      body: JSON.stringify(reqContent)
   };

   if(isNotNew){
      reqOptions.url = options.url + '/api/now/table/' + options.Table + '/' + this.sys_id;
      reqOptions.method = 'PUT';
      
   }
   else{
      reqOptions.url = options.url + '/api/now/table/' + options.Table;
      reqOptions.method = 'POST';
   }

   request(reqOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         body = JSON.parse(body);
         callback(body);
      }
      else{
         //handle error...
      }
   });
};

// The main function for the plugin – what the user calls – should return
// a stream.
var servicenowUploaderPlugin = function(options) {
   return map(function(file, cb) {
      var snFile = new ServiceNowFile(file);
      snFile.readFile(function(fileData){
         snFile.fileData = fileData;
         snFile.checkIfFileExistsInSN(options, function(exists, body){
            if(exists) snFile.sys_id = body.result[0].sys_id;
            snFile.uploadToSN(exists, options, function(data){
               cb();
            });
         });
      });

   });
};

// Export the plugin main function
module.exports = servicenowUploaderPlugin;