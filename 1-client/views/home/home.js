app.controller('SequenceController', function ($scope) {

	function Sequencer () {
		this.sequence = [];
		this.push = function(block) {
			this.sequence.push(block);
		};
		// this.pop = function() {
		// 	this.sequence.pop();
		// }

		this.run = function() {
			$scope.startBlock.execute();
			for (var i = 0; i < this.sequence.length; i++) {
				if (i === 0) {
					this.sequence[i].setInput($scope.startBlock.output);
					this.sequence[i].execute();
				} else {
					this.sequence[i].setInput(this.sequence[i-1].output);
					this.sequence[i].execute();
				}
				console.log("Ran a block!");
			}
			// console.log(this.sequence[this.sequence.length-1].output);
		}
	}

	function StartBlock () {
		this.input;
		this.funct;
		this.language;
		this.execute = function() {
			this.output = eval("(" + this.funct + ")" + "(" + this.input + ")");

			// Write the function to a file with appropriate readFile and writeFile methods in correct language
			// fs.writeFile('files')
			// 
		};
	}

	function Block () {
		this.input;
		this.funct;
		this.setInput = function(input) {
			this.input = input;
		}
		this.execute = function() {
			this.output = eval("(" + this.funct + ")" + "(" + this.input + ")");
		};
	}

	$scope.sequencer = new Sequencer();
	$scope.startBlock = new StartBlock();

    $scope.createBlock = function() {
    	var block = new Block();
    	$scope.sequencer.push(block);
    	console.log("New Block created!");
    }

    $scope.runSequence = function() {
    	$scope.sequencer.run();
    }

});