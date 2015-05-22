#!/usr/bin/env node

var Sails = require('sails');
var Promise = require('promise');

Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); process.exit(); }

  BookFile.find().limit(2).
    then(function(books) {
      return box_utils.downloadBookFile(books[0]);
    }).
    then(function(book) { sails.log.info(book); process.exit(); }).
    catch(function(err) { sails.log.error(err); process.exit(); });

});
