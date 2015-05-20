var Promise = require('promise');

var retrieve = function() {
  return OauthAccessToken.find().
    limit(1).
    then(function(oats) {
      return new Promise(function(resolve, reject) {
        if (oats.length > 0) {
          resolve(oats[0]);
        } else {
          resolve();
        }
      });
    });
};

module.exports = {

  schema: true,

  attributes: {

    access_token: {
      type: 'string',
      required: true
    },

    expires_in: {
      type: 'integer',
      required: true
    },

    expires_on: {
      type: 'datetime',
      required: true
    },

    refresh_token: {
      type: 'string',
      required: true
    },

    token_type: {
      type: 'string',
      required: true
    },

    isExpired: function() {
      return (Date.compare(this.expires_on, new Date) === -1) ? true : false
    }

  },

  beforeValidate: function(values, callback) {
    values.expires_on = new Date(new Date().getTime() + (1000 * values.expires_in));
    callback();
  },

  retrieve: retrieve,

  updateOrCreate: function(oat) {
    return retrieve().
      then(function(existing_oat) {
        return new Promise(function(resolve, reject) {
          if (existing_oat) {
            OauthAccessToken.update({id: existing_oat.id}, oat).
              then(function(updatedObjects) {
                if (updatedObjects.length != 1) {
                  return reject(new Error("Unable to update OauthAccessToken with id: " + existing_oat.id));
                }
                resolve(updatedObjects[0]);
              }).
              catch(reject);
          } else {
            OauthAccessToken.create(oat).
              then(resolve).
              catch(reject);
          }
      });
    });
  }

};
