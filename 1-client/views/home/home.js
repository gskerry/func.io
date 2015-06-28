app.controller('SequenceController', function ($scope, $http) {

	function Sequencer () {
		this.sequence = [];
		this.push = function(block) {
			this.sequence.push(block);
		};
		this.sequenceId = Date.now();

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
		this.blockPosition = "start";
		this.execute = function() {
//			this.output = eval("(" + this.funct + ")" + "(" + this.input + ")");

//			Make a request to the server with the block params

			var blockContents = {
		    	input: this.input,
		    	language: this.language,
		    	blockPosition: this.blockPosition,
		    	funct: this.funct
			}

			$http.get('/api/scriptwriter', {
			    params: blockContents
		    })
			
		};
	}

	function Block (position) {
		this.input;
		this.funct;
		this.blockPosition = position;
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
    	var block = new Block($scope.sequencer.length);
    	$scope.sequencer.push(block);
    	console.log("New Block created!");
    }

    $scope.runSequence = function() {
    	$scope.sequencer.run();
    }

});