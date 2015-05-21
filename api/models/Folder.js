module.exports = {

  schema: true,

  attributes: {
    
    /**
     * This is the Box folder ID. With this ID
     * you can immediately access the folder without 
     * navigation.
     */
    folderId: {
      type: 'string',
      required: true
    },

    parentFolderId: {
      type: 'string',
      required: false
    },

    name: {
      type: 'string',
      required: true
    }
  }
};
