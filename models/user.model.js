const object = require("@hapi/joi/lib/types/object.js");
const { json } = require("express");
const mongoose = require("mongoose");
require("./Drawer.model.js");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      //unique: true,
      required: [true, "email can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    password: {
      type: String,
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      required: [true, "password phone can't be blank"],
    },
    rol: {
      type: String,
    },
    drawersAccess: [{ type: Schema.Types.ObjectId, ref: "Drawer" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
