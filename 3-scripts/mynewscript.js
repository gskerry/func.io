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