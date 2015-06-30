var async = require('async');
var mongoose = require('mongoose');
var router = require('express').Router();
module.exports = router;

var BlockModel = mongoose.model('Block');

router.get('/', function (req, res) {
    
    // var searchParams = req.query.param ? { param: req.query.param } : {};

	BlockModel.find()
		// .populate('')
		.exec(function(err, blocks){
			if(err) throw err
			console.log('foundblocks', blocks)
			res.json(blocks);
		});

});