#!/usr/bin/env node

var Sails = require('sails');
var Promise = require('promise');

Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); process.exit(); }

  sails.hooks.email.send('testEmail', {
    recipientName: "Joe",
    senderName: "Sue" }, {
      to: 'dave.sieh@providigm.com',
      subject: 'Hi there'
    }, function(err) {
      if (err) { return sails.log.error(err); process.exit(); }
      sails.log.info("It worked!");
      process.exit();
    });
});
