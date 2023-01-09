const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var verifySupperAdminToken = require("../controllers/AuthController").verifySupperAdminToken;
let User = require("../models/User.model");
let Drawer = require("../models/Drawer.model");


//supperadmin can add a new shulter
router.post("/createDrawers", async function (req, res) {
    const name = req.body.name;
    const shulter = req.body.shulter;
    const closet = req.body.closet;


    // add new drawer
    const newDrawer = new Drawer({
        name,
        shulter,
        closet
    });

    newDrawer
        .save()
        .then(() => {
            return res.send("Drawer created successfully");
        })
        .catch((err) => res.status(500).json({ message: err }));
});


//supperadmin can add a users to drawer
router.post("/addUsersToDrawer", async function (req, res) {
    const drawerId = req.body.drawerId;
    const usersList = req.body.usersList;

    Drawer.findById(drawerId).then((drawer) => {
        drawer.usersList.push(usersList);
        drawer.save()
            .then(() => {
                usersList
                    .map((userId) => {
                        User.findById(userId).then((user) => {
                            user.drawersAccess.push(drawerId);
                            user.save()
                                .then(() => {
                                })
                                .catch((err) => res.status(500).json({ message: err }));
                        });
                    })
                return res.send("users have access to this drawer now");
            })
            .catch((err) => res.status(500).json({ message: err }));
    })
        .catch((err) => res.status(500).json({ message: err }));
});


module.exports = router;
