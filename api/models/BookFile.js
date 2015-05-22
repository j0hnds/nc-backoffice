/*
 * Here's what we get from Box.
 *
 * { type: 'file',
 *   id: '1662189118',
 *   file_version:
 *     { type: 'file_version',
 *       id: '2787744653',
 *       sha1: '77532547b8e780ad0a923bae2715318fa0e6428c' },
 *   sequence_id: '0',
 *   etag: '0',
 *   sha1: '77532547b8e780ad0a923bae2715318fa0e6428c',
 *   name: '139 Mining Record.pdf' }
 */
module.exports = {

  schema: true,

  attributes: {

    /**
     * This is the unique id of the file on Box
     */
    bookFileId: {
      type: "string",
      required: true
    },
    
    /**
     * The sha1 hash of the file. Use this to verify downloads and to 
     * determine if the file has been modified on box.
     */
    sha1: {
      type: "string",
      required: true
    },

    /**
     * The file name
     */
    name: {
      type: "string",
      required: true
    },

    /**
     * The id of the folder containing this file.
     */
    folderId: {
      type: "string",
      required: true
    },

    /**
     * Flag to indicate if the file has already been processed. If
     * true and the sha1 is the same, then there is no need to download
     * the file.
     */
    processed: {
      type: "boolean",
      required: true,
      defaultTo: false
    }
  }
};
