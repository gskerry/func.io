
var fs = require('fs')
var terminal = require('child_process').spawn('bash')
var router = require('express').Router();
module.exports = router;

router.get('/', function (req, res) {
	res.send("Hit the scriptwriter API");

	var extBook = {
		'node' : '.js',
		'python' : '.py'
	}

	var imageDex = {
		'node' : '4797dc6f7a9c'
	}

	var lingocmd = req.query.lingocmd;
	var ext = extBook[lingocmd]
	var infile = req.query.infile;
	// console.log('infile: ',infile);
	var scriptname = req.query.scriptname;
	var ext = extBook[lingocmd]
	var scriptfile = scriptname + ext
	var scriptcontent = req.query.scriptcontent;

	fs.writeFile('3-scripts/' + scriptfile + '', scriptcontent, function(err){
		if (err) throw err;
		console.log('scriptfile saved.');
	});

	var image = imageDex[lingocmd];
	console.log("image: ",image)

	// (!) PLUG - HARDCODED
	var outfile = '789012.json'


	// fs.watch()
	fs.readdir('/vagrant/io.playground/4-data',function(err, files){
		if(err)
			console.log(err);
		else
			console.log(files);
	});
	



	terminal.stdout.on('data', function (data) {
	    console.log('stdout: ' + data);
	});

	terminal.stderr.on('data', function (data) {
	    console.log('stderr: ' + data);
	});

	terminal.on('exit', function (code) {
		console.log('child process exited with code ' + code);
	});

	setTimeout(function() {
		console.log('Sending stdin to terminal');
		terminal.stdin.write('sudo docker run -i --rm -v "$PWD":/src/app -w /src/app ' + image + ' ' + lingocmd + ' ' + '3-scripts/'+scriptfile + ' ' + '4-data/'+infile + ' ' + '4-data/'+outfile + '\n');
		// terminal.stdin.write('echo "Hello $USER. Your machine runs since:"\n');
		// terminal.stdin.write('uptime\n');
		// console.log('Ending terminal session');
		terminal.stdin.end();
	}, 1000);

});
