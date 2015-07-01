app.controller('SequenceController', function ($scope, $http) {

	$scope.lingos = ['node', 'ruby'];
	$scope.types = ['string', 'integer', 'array', 'object'];

	$scope.savedblocks = [];

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
					if(this.sequence[i].input_type === $scope.startBlock.output_type){
						this.sequence[i].setInput($scope.startBlock.output);
						this.sequence[i].execute();	
					} else {
						alert("IO mismatch");
						return;
					}
				} else {
					if(this.sequence[i].input_type === this.sequence[i-1].output_type){
						this.sequence[i].setInput(this.sequence[i-1].output);
						this.sequence[i].execute();						
					} else {
						alert("IO mismatch");
						return;
					}
				}
				console.log("Ran a block!");
			}
			// console.log(this.sequence[this.sequence.length-1].output);
		}
	}

	function StartBlock () {
		var that = this;
		// if you've set this to 'that', should the properties be defined on 'that'?
		this.input;
		this.input_type;
		this.output_type;
		this.funct;
		this.language;
		this.name;
		this.blockPosition = "start";
		
		this.save = function(){
			
			console.log("save fired.")

			var blockContents = {
				'name': this.name,
				'input_type': this.input_type,
				'lingo': this.language,
				'script': this.funct
			}

			console.log("blockContents:", blockContents)

			$http.get('/api/saver', {
			    params: blockContents
		    }).
				success(function(data, status, headers, config) {
				    console.log("success: " + data);
				}).
				error(function(data, status, headers, config) {
				    console.log("Err: " + data);
				});

		};

		this.execute = function() {
//			this.output = eval("(" + this.funct + ")" + "(" + this.input + ")");

//			Make a request to the server with the block params

			var blockContents = {
		    	input: this.input,
		    	input_type: this.input_type,
		    	language: this.language,
		    	blockPosition: this.blockPosition,
		    	funct: this.funct
			}


			$http.get('/api/scriptwriter', {
			    params: blockContents
		    }).
				success(function(data, status, headers, config) {
				    console.log("Received response successfully: " + data);
				    console.log(that.output);
				    that.output = data;
				}).
				error(function(data, status, headers, config) {
				    console.log("Err in response: " + data);
				});
			
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

	// Update the function in the startblock and keep it synchronized wit hte model
	// Kinda dirty, but it works

	editor.getSession().on('change', function(){
		textarea.val(editor.getSession().getValue());
		$scope.startBlock.funct = editor.getSession().getValue();
	});

	$scope.createBlock = function() {
		var block = new Block($scope.sequencer.length);
		$scope.sequencer.push(block);
		console.log("New Block created!");
	}

	$scope.addBlock = function(savedblock) {
		var block = new Block($scope.sequencer.length);
		
		block.input_type = savedblock.input_type;
		block.funct = savedblock.script;
		block.language = savedblock.lingo;
		block.name = savedblock.name;

		$scope.sequencer.push(block);
		console.log("New Block Added!");
	}	

    $scope.runSequence = function() {
    	$scope.sequencer.run();
    }

    $scope.pullBlocks = function(){

    	console.log('pullBlocks FIRED')

    	$http.get('/api/blockgetter', {
			    // params: blockContents
		    }).
				success(function(data, status, headers, config) {
				    console.log("success: " + data);
				    $scope.savedblocks = data;
				    console.log('savedBlocks: ',$scope.savedBlocks)
				}).
				error(function(data, status, headers, config) {
				    console.log("Err: " + data);
				});

	    

    }

	$scope.pullBlocks();

});