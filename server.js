const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const supperadminRouter = require("./routes/supperadmin");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

// https://safr.herokuapp.com
// http://localhost:3000

const app = express();
const port = process.env.PORT || 3000;
// app.use(express.json());

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use("/auth", authRouter);
app.use("/supperadmin", supperadminRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);


app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
