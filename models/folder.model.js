const mongoose = require("mongoose");
require("./File.model.js");
require("./Drawer.model.js");

const Schema = mongoose.Schema;

const folderSchema = new Schema(
  {
    folderName: {
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
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
    drawer: { type: Schema.Types.ObjectId, ref: "Drawer" },
  },
  {
    timestamps: true,
  }
);

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
