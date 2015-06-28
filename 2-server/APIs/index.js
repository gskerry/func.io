'use strict';
var router = require('express').Router();
var fs = require('fs')
var terminal = require('child_process').spawn('bash')

module.exports = router;

router.use('/scriptwriter', require('./scriptwriter'));
// router.use('/seatgeek', require('./seatgeek'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});