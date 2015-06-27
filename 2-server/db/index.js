'use strict';
var Q = require('q');
var path = require('path');
var chalk = require('chalk');
var mongoose = require('mongoose');

var DATABASE_URI = 'mongodb://localhost:27017/funcio'

var db = mongoose.connect(DATABASE_URI).connection;

require('./models/block');

var startDbPromise = new Q(function (resolve, reject) {
    db.on('open', resolve);
    db.on('error', reject);
});

console.log(chalk.yellow('Opening connection to MongoDB . . .'));

startDbPromise.then(function () {
    console.log(chalk.green('MongoDB connection opened!'));
});

module.exports = startDbPromise;
