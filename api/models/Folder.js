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

    /**
     * This is the Box id of the parent folder of this
     * folder.
     */
    parentFolderId: {
      type: 'string',
      required: false
    },

    /**
     * This is the name of the folder
     */
    name: {
      type: 'string',
      required: true
    }
  }
};
