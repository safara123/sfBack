const mongoose = require("mongoose");
require("./folder.model.js");
require("./user.model.js");

const Schema = mongoose.Schema;

const fileSchema = new Schema(
  {
    fileName: {
      type: String,
    },
    color: {
      type: String,
    },
    attachment: {
      type: String,      
    },
    firstDateIn: {
      type: Date,
    },
    firstDateInUser: { type: Schema.Types.ObjectId, ref: "User" },
    firstDateOut: {
      type: Date,
    },
    firstDateOutUser: { type: Schema.Types.ObjectId, ref: "User" },
    lastDateIn: {
      type: Date,
    },
    lastDateInUser: { type: Schema.Types.ObjectId, ref: "User" },
    lastDateOut: {
      type: Date,
    },
    lastDateOutUser: { type: Schema.Types.ObjectId, ref: "User" },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;