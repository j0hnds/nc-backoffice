module.exports = (function() {

  var request = require('request');
  var Promise = require('promise');

  String.prototype.endsWith = function (s) {
    return this.length >= s.length && this.substr(this.length - s.length) == s;
  }

  var inventoryBoxFolder = function(boxFolderId) {
    return new Promise(function(resolve, reject) {
      var limit = 100;
      var offset = 0;
      var totalCount = 0;
      async.doWhilst(function processFolder(cb) {
        getFolderItems(boxFolderId, limit, offset).
          then(function(folderItems) {
            totalCount = folderItems.total_count;
            offset += limit; // Get ready for the next iteration
            // Process the folder items
            var justBookFiles = _.filter(folderItems.entries, function predicate(item) {
              return item.type === 'file' && item.name.endsWith('.pdf');
            });
            saveBookFiles(boxFolderId, justBookFiles).
              then(function() { cb(); }).
              catch(cb);
          }).
          catch(cb);
      }, function moreFolders() {
        return offset < totalCount;
      }, function doneProcessing(err) {
        if (err) { return reject(err); }
        resolve();
      });
    });
  };

  var saveBookFiles = function(boxFolderId, bookFiles) {
    return new Promise(function(resolve, reject) {
      async.eachLimit(bookFiles, 10, function processBook(book, cb) {
        // Check to see if the book has already been inventoried...
        BookFile.find({bookFileId: book.id, sha1: book.sha1}).
          then(function(books) {
            if (books.length > 0) {
              sails.log.silly("Book already inventoried: id(%s), sha1(%s)", book.id, book.sha1);
              return cb();
            }
            // Book needs to be inventoried, save it up
            var bookObj = {
              bookFileId: book.id,
              sha1: book.sha1,
              name: book.name,
              folderId: boxFolderId
            };
            BookFile.create(bookObj).
              then(function(newBook) { cb(); }).
              catch(cb);
          }).
          catch(cb);
      }, function doneProcessing(err) {
        if (err) { return reject(err); }
        resolve();
      });
    });
  };

  var getFolderItems = function(folderId, limit, offset) {
    return getAccessToken().
      then(function(access_token) {
        var options = {
          url: sails.config.box_config.boxApiUri + '/folders/' + folderId + '/items',
          headers: {
            "Authorization": "Bearer " + access_token
          },
          qs: {
            limit: limit,
            offset: offset
          }
        };

        return new Promise(function(resolve, reject) {
          request(options, function(err, response, body) {
            if (err) { return reject(err); }
            if (response.statusCode !== 200) {
              return reject(new Error("Error getting folder: " + response.statusCode));
            }
            resolve(JSON.parse(body));
          });
        });
      });
  };

  var ourRedirectUrl = function() {
    if (process.env.NODE_ENV === 'development') {
      return sails.config.box_config.devRedirectUri;
    } else {
      return sails.config.box_config.prdRedirectUri;
    }
  };

  var refreshAccessToken = function(refreshToken) {
    return new Promise(function(resolve, reject) {
      var url = sails.config.box_config.boxAuthBaseUri + '/' + sails.config.box_config.tokenUri;
      var formParams = {
        form: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: sails.config.box_config.clientId,
          client_secret: sails.config.box_config.clientSecret
        }
      };

      // Post the request to box to refresh the access token
      request.post(url, formParams, function(err, response, body) {
        if (err) { return reject(err); }
        if (response.statusCode !== 200) {
          var err = new Error("Non-200 response from Box: " + response.statusCode);
          return reject(err);
        }
        resolve(JSON.parse(body));
      });
    });
  };

  var getAccessToken = function() {
    return OauthAccessToken.retrieve().
      then(function(oat) {
        return new Promise(function(resolve, reject) {
          if (! oat) { return reject(new Error("No access token; have the user request one")); }
          if (oat.isExpired()) {
            sails.log.silly("Access token has expired...refreshing token");
            refreshAccessToken(oat.refresh_token).
              then(OauthAccessToken.updateOrCreate).
              then(function(updatedOat) {
                resolve(updatedOat.access_token);
              }).
              catch(reject);
          } else {
            resolve(oat.access_token);
          }
        });
      });
  };

  var mod = {

    /**
     * Returns the redirect URL for our application based on
     * the mode of the application ('development', or 'production').
     */
    ourRedirectUrl: ourRedirectUrl,

    /**
     * Returns the URL that redirects the user to the Box authorization
     * screen.
     */
    authorizeRedirectUrl: function() {

      var redirectUrl = sails.config.box_config.boxAuthBaseUri + '/' + sails.config.box_config.authorizeUri + '?';
      redirectUrl += "response_type=code&";
      redirectUrl += "client_id=" + encodeURIComponent(sails.config.box_config.clientId) + "&";
      redirectUrl += "redirect_uri=" + encodeURIComponent(ourRedirectUrl()) + "&";
      redirectUrl += "state=abc123";

      return redirectUrl;
    },

    /*
     * Given the code returned from the box authentication process, this
     * makes a request to Box for an API access token.
     *
     * The response (if successful).
     *
     * { access_token:"GNYXJwWJSm2wBEmesiUfCe6jM5WAqemT",
     *   expires_in:3605,
     *   restricted_to:[],
     *   refresh_token:"3ZZG9NAKhM5Z3RXlODBZ2bz3HwNBcch2Jkzdtjwfrl2E0AxXmVfoGu7Zp9LiZFjO",
     *   token_type:"bearer" }
     */
    requestAccessToken: function(code) {
      return new Promise(function(resolve, reject) {
        var url = sails.config.box_config.boxAuthBaseUri + '/' + sails.config.box_config.tokenUri;
        var formParams = {
          form: {
            grant_type: 'authorization_code',
            code: code,
            client_id: sails.config.box_config.clientId,
            client_secret: sails.config.box_config.clientSecret,
            redirect_uri: ourRedirectUrl()
          }
        };

        // Post the request to box to get the access token for the first time
        request.post(url, formParams, function(err, response, body) {
          if (err) { return reject(err); }
          if (response.statusCode !== 200) {
            var err = new Error("Non-200 response from Box: " + response.statusCode);
            return reject(err);
          }
          resolve(JSON.parse(body));
        });
      });
    },

    /**
     * Given the refresh token returned from the last request for an
     * API access token, request a new access token.
     */
    refreshAccessToken: refreshAccessToken,

    /**
     * Retrieve an access token we can use for a BOX api call.
     * Error if there is no current access token. If the current access token
     * has expired, refresh the access token, and return it.
     */
    getAccessToken: getAccessToken,

    /**
     * Retrieve the details of the specified folder.
     */
    getFolder: function(folderId) {
      return getAccessToken().
        then(function(access_token) {
          var options = {
            url: sails.config.box_config.boxApiUri + '/folders/' + folderId,
            headers: {
              "Authorization": "Bearer " + access_token
            }
          };

          return new Promise(function(resolve, reject) {
            request(options, function(err, response, body) {
              if (err) { return reject(err); }
              if (response.statusCode !== 200) {
                return reject(new Error("Error getting folder: " + response.statusCode));
              }
              resolve(JSON.parse(body));
            });
          });
        });
    },

    /**
     * Retrieves the list of items in the specified folder. Limit is the maximum
     * number of items to return at a time and offset is the offset in to the
     * total list (0-based).
     */
    getFolderItems: getFolderItems,

    /**
     * Given a list of items from Box, check to see if each item has already
     * been inventoried, and if not, create a new record.
     * This method assumes that the bookFiles parameter has already been 
     * filtered to contain only books (pdfs) and no folders.
     */
    saveBookFiles: saveBookFiles,

    inventoryBoxFolder: inventoryBoxFolder,

    inventoryBoxFolders: function() {
      return Folder.find().
        then(function(folders) {
          return new Promise(function(resolve, reject) {
            async.eachLimit(folders, 1, function processFolder(folder, cb) {
              sails.log.info("Inventorying folder: %s", folder.name);
              inventoryBoxFolder(folder.folderId).
                then(function() { cb(); }).
                catch(cb);
            }, function doneProcessing(err) {
              if (err) { return reject(err); }
              resolve();
            });
          });
        });
    }

  };

  return mod;
}());
