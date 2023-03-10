const mongoose = require("mongoose");
require("./folder.model.js");
require("./file.model.js");

const Schema = mongoose.Schema;

const relatedSchema = new Schema(
  {
    userId: {
      type: String,
    },
    adminId: {
      type: String,
    },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    filesId: [{ type: Schema.Types.ObjectId, ref: "File" }],
  },
  {
    timestamps: true,
  }
);

const Related = mongoose.model("Related", relatedSchema);

module.exports = Related;
