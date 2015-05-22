#!/usr/bin/env node

var Sails = require('sails');
var Promise = require('promise');

Sails.load(function(err, sails) {
  if (err) { return sails.log.error(err); process.exit }

  Folder.find().
    then(function (folders) {
      async.eachLimit(folders, 1, function processFolder(folder, cb) {
        var numFiles = 0;
        var totalFiles = 0;
        var limit = 100;
        var offset = 0;
        async.doWhilst(function processBatch(bcb) {
          getFolderItems(folder.id, limit, offset).
            then(function(items) {
              totalFiles = items.total_count;
              numFiles += limit;
              // Process each item...
              bcb();  // Make sure you call the callback when done...
            });
        }, function theTest(function() {
          return numFiles < totalFiles;
        }, function theStopper(function(err) {
          if (err) { sails.log.error(err); }
        });

      }, function doneWithAllFolders(err) {
        if (err) {
          sails.log.error(err);
        } else {
          sails.log.info("Done processing folders");
        }
        process.exit();
      });
    }).
    catch(function (err) {
      sails.log.error(err);
      process.exit();
    });

});
