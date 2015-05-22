#!/usr/bin/env node

var Sails = require('sails');
var Promise = require('promise');

Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); process.exit }

  box_utils.inventoryBoxFolders().
    then(function() { 
      sails.log.info("Done inventorying Box folders."); 
      process.exit();
    }).
    catch(function (err) {
      sails.log.error(err);
      process.exit();
    });

});
