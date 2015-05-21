#!/usr/bin/env node

var Sails = require('sails');
var Promise = require('promise');

/*
 * These are the folder ID's for the current book folders 
 * in Box.
 * info: Entry(245749272): BOOKS - CAMPBELL CO
 * info: Entry(195419501): BOOKS - JOHNSON CO
 * info: Entry(326434345): BOOKS - SHERIDAN CO
 */
Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); }

  box_utils.getFolder(195419501).
    then(function(folder) {
      return new Promise(function(resolve, reject) {
        sails.log.info("Number of items in folder: %d", folder.item_collection.total_count);
        _.forEach(folder.item_collection.entries, function(item) {
          // sails.log.info("Entry(%d): %s", item.id, item.name);
          sails.log.info(item);
        });
        resolve(folder);
      });
    }).
    then(function(folder) { sails.log.info(folder); process.exit(); }).
    catch(function(err) { sails.log.error(err); process.exit(); });

});
