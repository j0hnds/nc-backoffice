module.exports = (function() {

  var request = require('request');
  var Promise = require('promise');

  var ourRedirectUrl = function() {
    if (process.env.NODE_ENV === 'development') {
      return sails.config.box_config.devRedirectUri;
    } else {
      return sails.config.box_config.prdRedirectUri;
    }
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

      var redirectUrl = sails.config.box_config.boxBaseUri + '/' + sails.config.box_config.authorizeUri + '?';
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
        var url = sails.config.box_config.boxBaseUri + '/' + sails.config.box_config.tokenUri;
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
    refreshAccessToken: function(refreshToken) {
      return new Promise(function(resolve, reject) {
        var url = sails.config.box_config.boxBaseUri + '/' + sails.config.box_config.tokenUri;
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
    }

  };

  return mod;
}());
