#!/usr/bin/env node

var Sails = require('sails');

Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); }

  box_utils.getFolder(0).
    then(function(folder) {
      return new Promise(function(resolve, reject) {
        sails.log.info("Number of items in folder: %d", folder.item_collection.total_count);
        _.forEach(folder.item_collection.entries, function(item) {
          sails.log.info("Entry: %s", item.name);
        });
        resolve(folder);
      });
    }).
    then(function(folder) { sails.log.info(folder); process.exit(); }).
    catch(function(err) { sails.log.error(err); process.exit(); });

});
