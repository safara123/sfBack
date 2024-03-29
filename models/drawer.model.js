const mongoose = require("mongoose");
require("./folder.model.js");
require("./user.model.js");

const Schema = mongoose.Schema;

const drawerSchema = new Schema(
    {
        name: {
            type: String,
        },
        shulter: {
            type: String,
        },
        closet: {
            type: String,
        },
        drawerNumber: {
            type: String,
        },
        folders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
        usersList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true,
    }
);

const Drawer = mongoose.model("Drawer", drawerSchema);

module.exports = Drawer;
