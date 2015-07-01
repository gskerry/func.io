var fs = require('fs')
var terminal = require('child_process').spawn('bash')
var router = require('express').Router();
var async = require('async');
module.exports = router;
var mongoose = require('mongoose');
var chokidar = require('chokidar');

var Block = mongoose.model('Block');

router.get('/', function (req, res) {

	var languageToFileExtensionMapping = {
		'node' : '.js',
		'python' : '.py'
	}

	// NOTE: THIS IS UNIQUE FOR EACH DOCKER RUNNING ENVIRONMENT
	var dockerImageId = {
		// 'node' : 'b8844354c16f'
		'node' : '4797dc6f7a9c'
	}

	console.log(req.query);

	var language = req.query.language;
	var input_type = req.query.input_type;
	console.log("the input_type is:", input_type)
	var fileExtension = languageToFileExtensionMapping[language]
	var blockPosition = req.query.blockPosition;
	var scriptName = blockPosition + fileExtension

	var parser;

	(function(inp){
		if(inp === 'string'){parser = ""}
		else if(inp === 'integer'){parser = "input = Number(input)"}
	})(input_type);

	console.log("parser: ",parser)

	var scriptContent = "fs = require('fs'); \
	var myFunc = function(infile, outfile){ \
		fs.readFile(infile, function(err, input){ \
			if(err){console.log(err)}; \
			 " + parser + "; \
			 var result = function (input) {" + req.query.funct + "}(input); \
			 fs.writeFile(outfile, result, function (err) { \
			 	if (err) return console.log(err); \
			 	console.log('output written: ' + outfile); \
			 	fs.writeFile('6-docker-done/done.json', 'done', function (err) {if (err) return console.log(err);}); \
			 }); \
		}); \
	}; \
	myFunc(process.argv[2], process.argv[3]);" 

	var image = dockerImageId[language];
	console.log("imageId: ", image)

	//Define infile and outfile
	if (blockPosition === "start") {var outfile =  "0.json"} else {var outfile = (blockPosition + 1) + '.json'};
	var infile = blockPosition + '.json'
	var input = req.query.input;

	async.series([
		function(callback){
		    fs.writeFile('3-scripts/' + scriptName, scriptContent, function(err){
		    	if (err) console.log(err);
		    	console.log('scriptfile saved.');

		    	terminal.stdout.on('data', function (data) {
		    	    console.log('stdout: ' + data);
		    	});

		    	terminal.stderr.on('data', function (data) {
		    	    console.log('stderr: ' + data);
		    	});

		    	terminal.on('exit', function (code) {
		    		console.log('child process exited with code ' + code);
		    	});

		    	callback(null, 'one');
		    });
		},
		function(callback){
			fs.writeFile('4-data/' + blockPosition + '.json', input, function (err) {
				if (err) throw err;
				console.log('infile is saved!');
				callback(null, 'two');
			});
		},
		function(callback){
			console.log('Sending stdin to terminal');
			console.log('Running: ' + 'docker run -i --rm -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n')
			terminal.stdin.write('docker run -i --rm -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n');
			// terminal.stdin.on('end', function() {
			// 	//Add callback when docker is done writing
			// 	console.log("Done running docker");
			// 	callback(null, 'three');
			// });

			// Wait for docker to send word that it has finished running the script via the "done.json" file.
			var watcher = chokidar.watch('./6-docker-done/', {
			  ignored: /[\/\\]\./,
			  persistent: true
			});
			console.log("Chokidar should be created");
			var log = console.log.bind(console);

			watcher
			  .on('add', function(path) {
			  	log('File', path, 'has been added');
			  	// Here is the critical callback that only happens AFTER docker has finished EXECUTING the script
			  	callback(null, 'three');
			  	// Remove the done.json file
			  	fs.unlink('6-docker-done/done.json');
			  	// Close the watcher
			  	watcher.close();
			  });
		},
		function(callback){
			fs.readFile('4-data/' + outfile, function(err, data) {
				console.log('Going to send back: ' + data);
				res.send(data);
			})
		    callback(null, 'four');
		},
	]);

});
