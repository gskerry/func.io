fs = require('fs'); var myFunc = function(infile, outfile){fs.readFile(infile, function(err, input){if(err){throw err}; var result = function (input) {return input + 1;}(input);fs.writeFile(outfile, result, function (err) {if (err) return console.log(err);console.log('output written: ' + outfile);});});};myFunc(process.argv[2], process.argv[3]);