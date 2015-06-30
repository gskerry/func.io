'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');

// Import User model;
var Block = mongoose.model('Block');

router.get('/', function(req, res) {

	console.log("req.query: ", req.query);

	var block = new Block(req.query);
	console.log("new block: ",block);

	block.save(function (err, data) {
		if (err) return console.error(err);
		res.sendStatus(200);
	});

});
