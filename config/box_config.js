module.exports.box_config = {

  clientId: process.env.BOX_CLIENT_ID,
  clientSecret: process.env.BOX_CLIENT_SECRET,

  boxAuthBaseUri: 'https://app.box.com/api/oauth2',
  authorizeUri: 'authorize',
  tokenUri: 'token',

  devRedirectUri: 'http://localhost:1337/batch_auth',
  prdRedirectUri: 'https://curator/batch_auth',

  boxApiUri: 'https://api.box.com/2.0',
};
