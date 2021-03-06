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
		'ruby' : '.rb'
	}

	// NOTE: THIS IS UNIQUE FOR EACH DOCKER RUNNING ENVIRONMENT
	var dockerImageId = {
		// Alex's node image mapping
		'node' : 'b8844354c16f',

		// Greg's node image mapping
		// 'node' : '4797dc6f7a9c'

		// Alex's ruby image mapping
		'ruby' : '587d0d048bce'

		// Greg's ruby image mapping
	}

	console.log(req.query);

	var language = req.query.language;
	console.log("The language is", language);
	var input_type = req.query.input_type;
	console.log("the input_type is:", input_type);
	var fileExtension = languageToFileExtensionMapping[language]
	var blockPosition = req.query.blockPosition;
	var scriptName = blockPosition + fileExtension;
	var scriptContent;
	var parser;

	if (language === "node") {	
		(function(inp){
			if(inp === 'string'){parser = ""}
			else if(inp === 'integer'){parser = "input = Number(input)"}
		})(input_type);
	} else if (language === "ruby") {
		parser = "";
	}

	console.log("parser: ",parser)

	if (language === "node") {
		console.log("USING NODE SCRIPT!");
		scriptContent = "fs = require('fs'); \
		var myFunc = function(infile, outfile){ \
			fs.readFile(infile, function(err, input){ \
				if(err){console.log(err)}; \
				 " + parser + "; \
				 var result = function (input) {" + req.query.funct + "}(input); \
				 fs.writeFile(outfile, result, function (err) { \
				 	if (err) return console.log(err); \
				 	console.log('output written: ' + outfile); \
				 	fs.writeFile('6-docker-done/done.json', 'done', function (err) {if (err) {console.log(err)}; console.log('DONE WRITING done.json');}); \
				 }); \
			}); \
		}; \
		myFunc(process.argv[2], process.argv[3]);" 
	} else if (language === "ruby") {
		console.log("USING RUBY SCRIPT!");
		scriptContent = " \
			def myFunc(pathToInputFile, pathToOutputFile); \
				input = File.read(pathToInputFile); \
				def func(input); \
					" + req.query.funct + "; \
				end; \
				output = func(input); \
				File.open(pathToOutputFile, 'w') { |file| file.write(output) }; \
				File.open('6-docker-done/done.json', 'w') { |file| file.write('done') }; \
			end; \
			myFunc(ARGV.first, ARGV[1]);"
	}

	var image = dockerImageId[language];
	console.log("imageId: ", image)

	//Define infile and outfile
	if (blockPosition === "start") {var outfile =  "0.json"} else {var outfile = (blockPosition + 1) + '.json'};
	var infile = blockPosition + '.json'
	var input = req.query.input;

	async.series([
		function(callback){
			console.log("About to write script content of", scriptContent);
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
			// Wait for docker to send word that it has finished running the script via the "done.json" file.
			var watcher = chokidar.watch('./6-docker-done/', {
			  ignored: /[\/\\]\./,
			  persistent: true
			});
			console.log("Chokidar should be created");
			var log = console.log.bind(console);

			watcher
			  .on('add', function(path) {
			  	setTimeout(function() {		  		
				  	log('File', path, 'has been added');
				  	// Remove the done.json file
				  	fs.unlink('6-docker-done/done.json', function(err) {
				  		if (err) throw err;
				  		console.log('successfully deleted done.json');
				  	});
				  	// Here is the critical callback that only happens AFTER docker has finished EXECUTING the script
				  	callback(null, 'three');
				  	// Close the watcher
				  	watcher.close();
			  	}, 2000);
			  });

			console.log("The LANGUAGE IS", language);
			console.log("The IMAGE IS", image);
			console.log('Sending stdin to terminal');
			console.log('RUNNING: ' + 'docker run -d -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n')
			terminal.stdin.write('docker run -d -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n');

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
