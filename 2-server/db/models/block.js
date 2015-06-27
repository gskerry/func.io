'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name:{
      type: String,
      required: true,
      unique: true
    },
    lingo: {
        type: String,
        required: true
    },
    script: {
        type: String,
        required: true
    }
});

mongoose.model('Block', schema);
