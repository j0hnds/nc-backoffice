#!/usr/bin/env node

/*
 * This script will added the BigHorn folders to the mongo db. These will provide the basic 
 * template for the folders we want to search. We're restricting the set to these folders
 * because we can't depend on the fact that more folders might be added that we don't 
 * want to process.
 */
var Sails = require('sails');
var Promise = require('promise');

var BighornFolders = [
  {
    folderId: '245749272',
    parentFolderId: '0',
    name: 'BOOKS - CAMPBELL CO'
  },
  {
    folderId: '195419501',
    parentFolderId: '0',
    name: 'BOOKS - JOHNSON CO'
  },
  {
    folderId: '326434345',
    parentFolderId: '0',
    name: 'BOOKS - SHERIDAN CO'
  }
];

Sails.load(function(err, sails) {
  if (err) { sails.log.error(err); process.exit(); }
  Folder.destroy({}).
    then(function(deletedRecords) {
      async.eachLimit(BighornFolders, 10, function eachFolder(folder, callback) {
        Folder.create(folder).
          then(function(folder) {
            sails.log.info(folder);
            callback();
          }).
          catch(callback);
      }, function allDone(err) {
        sails.log.info(err);
        process.exit();
      });
    }).
    catch(function(err) {
      sails.log.error(err);
      process.exit();
    });
});
