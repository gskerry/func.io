var fs = require('fs')
var terminal = require('child_process').spawn('bash')
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');

var Block = mongoose.model('Block');

router.get('/', function (req, res) {

	var languageToFileExtensionMapping = {
		'node' : '.js',
		'python' : '.py'
	}

	// NOTE: THIS IS UNIQUE FOR EACH DOCKER RUNNING ENVIRONMENT
	var dockerImageId = {
		'node' : 'b8844354c16f'
	}

	console.log(req.query);

	var language = req.query.language;
	var fileExtension = languageToFileExtensionMapping[language]
	var blockPosition = req.query.blockPosition;
	var scriptName = blockPosition + fileExtension
	var scriptContent = "fs = require('fs'); var myFunc = function(infile, outfile){fs.readFile(infile, function(err, input){if(err){throw err}; var result = " + req.query.funct + "(input);fs.writeFile(outfile, result, function (err) {if (err) return console.log(err);console.log('output written: ' + outfile);});});};myFunc(process.argv[2], process.argv[3]);"

	var image = dockerImageId[language];
	console.log("imageId: ", image)

	//Define input and output files
	var input = req.query.input;

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

		if (blockPosition === "start") {var outfile =  "0.json"} else {var outfile = (blockPosition + 1) + '.json'};
		var infile = blockPosition + '.json'
		fs.writeFile('4-data/' + blockPosition + '.json', input, function (err) {
			if (err) throw err;
			console.log('infile is saved!');

			console.log('Sending stdin to terminal');
			console.log('Running: ' + 'docker run -i --rm -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n')
			terminal.stdin.write('docker run -i --rm -v "$PWD":/src/app -w /src/app ' + image + ' ' + language + ' ' + '3-scripts/'+scriptName + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n');
			// terminal.stdin.write('echo "Hello $USER. Your machine runs since:"\n');
			// terminal.stdin.write('uptime\n');
			// console.log('Ending terminal session');
			terminal.stdin.end();
		});

	});

});
