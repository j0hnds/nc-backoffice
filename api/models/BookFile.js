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

    bookFileId: {
      type: "string",
      required: true
    },
    
    sha1: {
      type: "string",
      required: true
    },

    name: {
      type: "string",
      required: true
    },

    processed: {
      type: "boolean",
      required: true,
      defaultTo: false
    }
  }
};
