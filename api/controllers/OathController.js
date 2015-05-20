var request = require('request');

module.exports = {

  getStarted: function(req, res) {

    //var oauth2 = require('simple-oauth2')({
      //clientID: CLIENT_ID,
      //clientSecret: CLIENT_SECRET,
      //site: 'https://app.box.com/api/oauth2/authorize',
      //tokenPath: ''
    //});

    //// Authorization uri definition
    //var authorization_uri = oauth2.authCode.authorizeURL({
      //redirect_uri: 'http://localhost:1337/batch_auth',
      //response_type: 'code',
      //scope: 'notifications',
      //state: '3(#0/!~'
    //});
    //
    var redirectUrl = "https://app.box.com/api/oauth2/authorize?";
    redirectUrl += "response_type=code&";
    redirectUrl += "client_id=" + encodeURIComponent(CLIENT_ID) + "&";
    redirectUrl += "redirect_uri=" + encodeURIComponent("http://localhost:1337/batch_auth") + "&";
    redirectUrl += "state=abc123";
    

    sails.log.info("Getting Started: %s", redirectUrl);
    // res.ok({message: "Yo dude"});
    res.redirect(redirectUrl);
  },

  callback: function(req, res) {
    var code = req.param('code');
    var state = req.param('state');
    sails.log.info('/batch_auth');

    if (state !== 'abc123') {
      sails.log.info("Invalid state returned: " + state);
      return res.status(401);
    }

    // Now make a request to get the token
    request.post('https://app.box.com/api/oauth2/token',
      { form: { 
          grant_type: 'authorization_code',
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: 'http://localhost:1337/batch_auth'
          //grant_type: encodeURIComponent('authorization_code'),
          //code: encodeURIComponent(code),
          //client_id: encodeURIComponent(CLIENT_ID),
          //client_secret: encodeURIComponent(CLIENT_SECRET),
          //redirect_uri: encodeURIComponent('http://localhost:1337/batch_auth')
        } 
      }, function (error, response, body) {
        if (error) {
          return res.negotiate(error);
        }
        if (response.statusCode !== 200) {
          sails.log.info("status code was " + response.statusCode);
          return res.status(500);
        }
        sails.log.info(body)
      });
    res.ok();
  }
};
