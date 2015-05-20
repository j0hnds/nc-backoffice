var request = require('request');

module.exports = {

  getStarted: function(req, res) {

    OauthAccessToken.retrieve().
      then(function(oat) {
        if (oat) { return res.ok(oat); }

        var redirectUrl = box_utils.authorizeRedirectUrl();

        sails.log.info("Getting Started: %s", redirectUrl);
        sails.log.info("Mode = " + process.env.NODE_ENV);
        res.redirect(redirectUrl);
      }).
      catch(res.negotiate);
  },

  callback: function(req, res) {
    var code = req.param('code');
    var state = req.param('state');
    sails.log.info('/batch_auth');

    if (state !== 'abc123') {
      sails.log.info("Invalid state returned: " + state);
      return res.status(401);
    }

    box_utils.requestAccessToken(code).
      then(OauthAccessToken.updateOrCreate).
      then(res.ok).
      catch(res.negotiate);
  }
};
