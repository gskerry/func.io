var path = require('path');
var express = require('express')

var app = express()

var root = path.join(__dirname, '../');
var bowerPath = path.join(root, './bower_components');
var browserPath = path.join(root, './1-client');

app.use(express.static(bowerPath));
app.use(express.static(browserPath));

var indexHtmlPath = path.join(__dirname, '/index.html');

var startDb = require('./db');

app.use('/api', require('./APIs'));

app.get('/', function (req, res) {
    res.sendFile(indexHtmlPath);
});

var server = app.listen(5001, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('io.playground is listening intently at http://%s:%s', host, port)
})
