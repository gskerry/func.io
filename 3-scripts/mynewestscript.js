fs = require('fs');

var myFunc = function(infile, outfile){
	
	fs.readFile(infile, function(err, data){
		if(err){
			throw err
		}
		
		var result = data.slice(4,data.length);

		fs.writeFile(outfile, result, function (err) {
			if (err) return console.log(err);
			console.log('output written: ' + outfile);
		});

	})

}

myFunc(process.argv[2], process.argv[3]);