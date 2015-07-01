'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name:{
      type: String,
      required: true,
      unique: true
    },
    input_type: {
        type: String,
        required: true
    },
    output_type: {
        type: String,
        required: true
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
