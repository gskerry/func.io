'use strict';
var router = require('express').Router();
var fs = require('fs')
var terminal = require('child_process').spawn('bash')

module.exports = router;

router.use('/scriptwriter', require('./scriptwriter'));
router.use('/saver', require('./saver'));
router.use('/blockgetter', require('./blockgetter'));

router.use(function (req, res) {
    res.status(404).end();
});