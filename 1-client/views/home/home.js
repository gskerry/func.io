app.controller('SequenceController', function ($scope, $http) {

	$scope.lingos = ['node', 'ruby'];
	$scope.types = ['string', 'integer', 'array', 'object'];

	$scope.savedblocks = [];

	function Sequencer () {
		this.sequence = [];
		var that = this;
		this.push = function(block) {
			this.sequence.push(block);
		};
		this.sequenceId = Date.now();

		this.runBlock = function(block, callback) {
			console.log("Block to be run is ", block);
			if (block.blockPosition === 0) {
				console.log("BLOCK 1")
				if(block.input_type === $scope.startBlock.output_type){
					block.setInput($scope.startBlock.output);
					block.execute(callback);	
				} else {
					alert("IO mismatch");
				}
			} else {
				console.log("BLOCK 2+")
				if(block.input_type === that.sequence[block.blockPosition-1].output_type){
					block.setInput(that.sequence[block.blockPosition-1].output);
					block.execute(callback);						
				} else {
					alert("IO mismatch");
				}
			}
		}

		this.run = function() {
			$scope.startBlock.execute()
				.then(function(){
					console.log("Executing normal blocks");
					if(!that.sequence[0]) {
						alert("No blocks!");
						return;
					}

					async.eachSeries(that.sequence, that.runBlock, function(err) {
						alert("DONE!")
					});

					// if(this.sequence[0].input_type === $scope.startBlock.output_type){
					// 	this.sequence[0].setInput(previousBlockOut);
					// 	this.sequence[1].execute();	
					// } else {
					// 	alert("IO mismatch");
					// 	return;
					// }

					// for (var i = 0; i < this.sequence.length; i++) {

					// } // close for loop	
				});
		}; // close run function 
	
	} // close Sequencer constructor

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
				'output_type': this.output_type,
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

			var blockContents = {
				input: this.input,
				input_type: this.input_type,
				output_type: this.output_type,
				language: this.language,
				blockPosition: this.blockPosition,
				funct: this.funct
			};

						return $http.get('/api/scriptwriter', {
							params: blockContents
						}).
						success(function(data, status, headers, config) {
							console.log("Received response successfully: " + data);
							console.log(that.output);
							that.output = data;
							return data;
						}).
						error(function(data, status, headers, config) {
							console.log("Err in response: " + data);
							return data;
						});

		} // close execute 

	} // close Startblock

			

	function Block (position) {
		var that = this;

		this.input;
		this.input_type;
		this.output_type;
		this.funct;
		this.blockPosition = position;
		
		this.setInput = function(input) {
			this.input = input;
		};
		
		this.save = function(){
			
			console.log("save fired.")

			var blockContents = {
				'name': this.name,
				'input_type': this.input_type,
				'output_type': this.output_type,
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

		this.execute = function(callback) {

			var blockContents = {
				input: this.input,
				input_type: this.input_type,
				output_type: this.output_type,
				language: this.language,
				blockPosition: this.blockPosition,
				funct: this.funct
			};

			$http.get('/api/scriptwriter', {
				params: blockContents
			}).
			success(function(data, status, headers, config) {
				console.log("Received response successfully: " + data);
				console.log(that.output);
				that.output = data;
				callback();
			}).
			error(function(data, status, headers, config) {
				console.log("Err in response: " + data);
				console.log(that.output);
				that.output = data;
				callback("Error");
			});
		};

	}; // close Block Constructor

	$scope.sequencer = new Sequencer();
	$scope.startBlock = new StartBlock();

	// Update the function in the startblock and keep it synchronized wit hte model
	// Kinda dirty, but it works

	editor.getSession().on('change', function(){
		textarea.val(editor.getSession().getValue());
		$scope.startBlock.funct = editor.getSession().getValue();
	});

	$scope.createBlock = function() {
		console.log("Creating Block with position", $scope.sequencer.sequence.length);
		var block = new Block($scope.sequencer.sequence.length);
		$scope.sequencer.push(block);
		console.log("New Block created!");
	};

	//This is for adding to the DB
	$scope.addSavedBlock = function(savedblock) {
		var block = new Block($scope.sequencer.sequence.length);
		
		block.input_type = savedblock.input_type;
		block.output_type = savedblock.output_type;
		block.funct = savedblock.script;
		block.language = savedblock.lingo;
		block.name = savedblock.name;

		$scope.sequencer.push(block);
		console.log("New Block Added!");
	};

    $scope.runSequence = function() {
		$scope.sequencer.run();
    };

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

    };

	$scope.pullBlocks();

});