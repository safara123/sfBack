const router = require("express").Router();
const VerifyAdminToken =
    require("../controllers/AuthController").verifyAdminToken;

let Folder = require("../models/folder.model");
let User = require("../models/user.model");
let FileO = require("../models/file.model");
let Drawer = require("../models/drawer.model");



router.post(
    "/register",
    VerifyAdminToken,
    async function (req, res) {
        const name = req.body.name;
        const password = req.body.password;
        const email = req.body.email;
        const rol = "user";

        //check if email exist
        let user = await User.findOne({ email: email });
        if (user) {
            //status 200
            return res.status(400).send("user already registered");
        }

        bcrypt.hash(password, 10, function (err, hashedPass) {
            if (err) {
                res.json({
                    error: err,
                });
            }
            if (hashedPass) {
                //else add new user
                const newUser = new User({
                    name,
                    password: hashedPass,
                    email,
                    rol
                });

                newUser
                    .save()
                    .then(() => {
                        const token = jwt.sign(
                            { id: newUser.id, name: newUser.name, email: newUser.email, rol: rol },
                            "verySecretValue",
                            { expiresIn: "24h" }
                        );
                        const response = {
                            token: token,
                            user: newUser,
                        };

                        res.send(response);
                    })
                    .catch((err) => res.status(400).send(err));
            }
        });
    }
);


//get all users
router.get("/getAllFolders",
    VerifyAdminToken,
    async function (req, res, next) {
        await Folder.find()
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });


//get all users
router.get("/getAllFiles",
    VerifyAdminToken,
    async function (req, res, next) {
        await FileO.find()
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });


//get all the folders in data base by pagination
router.get(
    "/getDrawersPagination",
    VerifyAdminToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }

        Drawer.count({}, function (error, numOfDocs) {
            const limit = numOfDocs;

            Drawer.find()
                .populate("folders")
                .populate("usersList")
                .skip(page * size - size)
                .limit(size)
                .then((drawers) => {
                    res.json({ drawers: drawers, count: limit });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    }
);
router.post(
    "/changePassword",
    VerifyAdminToken,
    async function (req, res) {
        const userId = req.body.userId;
        const password = req.body.password;
        //hashing the password the save it to user
        bcrypt.hash(password, 10, function (err, hashedPass) {
            if (err) {
                res.json({
                    error: err,
                });
            }
            if (hashedPass) {
                User.findById(userId)
                    .then((user) => {
                        user.password = hashedPass;
                        user.save();
                        res.send("password changed successfully!");
                    })
                    .catch((err) => res.status(400).send(err));
            }
        });
    }
);

//get all users
router.get("/getAllUsers",
    VerifyAdminToken,
    async function (req, res, next) {
        await User.find({ rol: "user" })
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });


router.post('/deleteUser', VerifyAdminToken, async function (req, res, next) {
    const userId = req.body.userId;
    await User.findById(userId)
        .then((user) => {
            user.remove();
            res.json("user deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));

})

router.post('/deleteDrawer', VerifyAdminToken, async function (req, res, next) {
    const drawerId = req.body.drawerId;
    await Drawer.findById(drawerId)
        .then((drawer) => {
            drawer.remove();
            res.json("drawer deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));

})


router.post('/deleteFolder', VerifyAdminToken, function (req, res, next) {
    const folderId = req.body.folderId;
    Folder.findById(folderId)
        .then((folder) => {
            folder.remove();
            folder.json("folder deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));
})

router.post('/deleteFile', VerifyAdminToken, function (req, res, next) {
    const fileId = req.body.fileId;
    FileO.findById(fileId)
        .then((file) => {
            file.remove();
            file.json("file deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));
})

router.get("/searchDrawers",
    VerifyAdminToken, async (req, res) => {
        const params = req.query;
        let page = req.query.page;
        let size = req.query.size;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }
        const count = await Drawer.find({ name: { $regex: params.drawerName } }).count();
        const result = await Drawer.find({ name: { $regex: params.drawerName } })
            .populate("folders")
            .populate("usersList")

        res.json({ drawers: result, count: count });
    });

//get all the folders in data base by pagination
router.get(
    "/getFilesPagination",
    VerifyAdminToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let folderId = req.query.folderId;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }
        if (folderId === "files") {
            FileO.count({}, function (error, numOfDocs) {
                const limit = numOfDocs;

                FileO.find()
                    .populate("folderId")
                    .populate("firstDateInUser")
                    .populate("firstDateOutUser")
                    .populate("lastDateInUser")
                    .populate("lastDateOutUser")
                    // .skip(page * size - size)
                    // .limit(size)
                    .then((file) => {
                        res.json({ file: file, count: limit });
                    })
                    .catch((err) => res.status(400).json("Error: " + err));
            });
            return;
        }
        FileO.count({}, function (error, numOfDocs) {
            const limit = numOfDocs;

            FileO.find({ folderId: folderId })
                .populate("folderId")
                .populate("firstDateInUser")
                .populate("firstDateOutUser")
                .populate("lastDateInUser")
                .populate("lastDateOutUser")
                // .skip(page * size - size)
                // .limit(size)
                .then((file) => {
                    res.json({ file: file, count: limit });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    }
);


router.get("/searchFiles", VerifyAdminToken, async (req, res) => {
    const params = req.query;
    let page = req.query.page;
    let size = req.query.size;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    const count = await FileO.find({ fileName: { $regex: params.fileName } }).count();
    const result = await FileO.find({ fileName: { $regex: params.fileName } })

    res.json({ files: result, count: count });
});


//get all the folders in data base by pagination
router.get(
    "/getFoldersPagination",
    VerifyAdminToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let drawerId = req.query.drawerId;

        if (!drawerId) {
            res.json({ folder: null });
        }
        if (drawerId == "folders") {
            Folder.count({}, function (error, numOfDocs) {
                const limit = numOfDocs;

                Folder.find()
                    .populate("drawer")
                    .populate("firstDateInUser")
                    .populate("firstDateOutUser")
                    .populate("lastDateInUser")
                    .populate("lastDateOutUser")
                    // .skip(page * size - size)
                    // .limit(size)
                    .then((folder) => {
                        res.json({ folder: folder, count: limit });
                    })
                    .catch((err) => res.status(400).json("Error: " + err));
            });
            return;
        }

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }

        Folder.count({}, function (error, numOfDocs) {
            const limit = numOfDocs;

            Folder.find({ drawer: drawerId })
                .populate("drawer")
                .populate("firstDateInUser")
                .populate("firstDateOutUser")
                .populate("lastDateInUser")
                .populate("lastDateOutUser")
                // .skip(page * size - size)
                // .limit(size)
                .then((folder) => {
                    res.json({ folder: folder, count: limit });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    }
);


router.get("/searchFolders", VerifyAdminToken, async (req, res) => {
    const params = req.query;
    let page = req.query.page;
    let size = req.query.size;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    const count = await Folder.find({ folderName: { $regex: params.folderName } }).count();
    const result = await Folder.find({ folderName: { $regex: params.folderName } })

    res.json({ folders: result, count: count });
});



//admin can add a new folder
router.post("/createFolder", VerifyAdminToken, async function (req, res) {
    const folderName = req.body.folderName;
    const drawer = req.body.drawerId;
    let date_ob = new Date();
    const firstDateIn = date_ob;
    const firstDateOut = null;
    const lastDateIn = date_ob;
    const lastDateOut = null;
    const firstDateInUser = req.decoded.id;
    const firstDateOutUser = null;
    const lastDateInUser = null;
    const lastDateOutUser = null;

    // add new folder
    const newFolder = new Folder({
        folderName,
        firstDateIn,
        firstDateInUser,
        firstDateOut,
        firstDateOutUser,
        lastDateIn,
        lastDateInUser,
        lastDateOut,
        lastDateOutUser,
        drawer
    });

    newFolder
        .save()
        .then(() => {
            Drawer.findById(drawer).then((d) => {
                d.folders.push(newFolder._id);
                d.save()
                    .then(() => {
                        res.send("Folder created successfully");
                    })
                    .catch((err) => res.status(500).json({ message: err }));
            })
                .catch((err) => res.status(500).json({ message: err }));
        })
        .catch((err) => res.status(500).json({ message: err }));
});

//admin can add a new file
router.post("/createFile", VerifyAdminToken, async function (req, res) {
    const fileName = req.body.fileName;
    const folderId = req.body.folderId;
    const color = req.body.color;
    const attachment= req.body.attachment;
    let date_ob = new Date();
    const firstDateIn = date_ob;
    const firstDateOut = null;
    const lastDateIn = date_ob;
    const lastDateOut = null;
    const firstDateInUser = req.decoded.id;
    const firstDateOutUser = null;
    const lastDateInUser = null;
    const lastDateOutUser = null;


    // add new file
    const newFile = new FileO({
        fileName,
        color,
        attachment,
        firstDateIn,
        firstDateInUser,
        firstDateOut,
        firstDateOutUser,
        lastDateIn,
        lastDateInUser,
        lastDateOut,
        lastDateOutUser,
        folderId
    });

    newFile
        .save()
        .then(() => {
            Folder.findById(folderId).then((folder) => {
                folder.files.push(newFile._id);
                folder.save()
                    .then(() => {
                        res.send("File created successfully");
                    })
                    .catch((err) => res.status(500).json({ message: err }));
            });
        })
        .catch((err) => res.status(500).json({ message: err }));
});

router.post("/editDrawerName", VerifyAdminToken, async function (req, res) {
    const name = req.body.name;
    const drawerId = req.body.drawerId;

    Drawer.findById(drawerId).then((drawer) => {
        drawer.name = name;
        drawer.save()
            .then(() => {
                return res.send("drawer name edited successfully");
            })
            .catch((err) => res.status(500).json({ message: err }));
    });
});

router.post("/editFolderName", VerifyAdminToken, async function (req, res) {
    const name = req.body.name;
    const folderId = req.body.folderId;

    Folder.findById(folderId).then((folder) => {
        folder.folderName = name;
        folder.save()
            .then(() => {
                return res.send("folder name edited successfully");
            })
            .catch((err) => res.status(500).json({ message: err }));
    });
});

router.post("/editFileName", VerifyAdminToken, async function (req, res) {
    const name = req.body.name;
    const fileId = req.body.fileId;

    FileO.findById(fileId).then((file) => {
        file.fileName = name;
        file.save()
            .then(() => {
                return res.send("file name edited successfully");
            })
            .catch((err) => res.status(500).json({ message: err }));
    });
});


//when user click in on the folder
router.post("/inFolder", VerifyAdminToken, async function (req, res) {
    const folderId = req.body.folderId;

    Folder.findById(folderId)
        .then((folder) => {
            let date_ob = new Date();
            folder.lastDateIn = date_ob;
            folder.lastDateInUser = req.decoded.id;
            folder.save()
                .then((folder) => {
                    return res.send("Folder in");
                })
                .catch((err) => res.status(500).json({ message: 'err in save the last date in.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the folder.' }));
});

//when user click in on the file
router.post("/inFile", VerifyAdminToken, async function (req, res) {
    const fileId = req.body.fileId;

    FileO.findById(fileId)
        .then((file) => {
            let date_ob = new Date();
            file.lastDateIn = date_ob;
            file.lastDateInUser = req.decoded.id;
            file.save()
                .then((file) => {
                    return res.send("File in");
                })
                .catch((err) => res.status(500).json({ message: 'err in save the last date in.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the file.' }));
});

//when user click out on the folder
router.post("/outFolder", VerifyAdminToken, async function (req, res) {
    const folderId = req.body.folderId;

    Folder.findById(folderId)
        .then((folder) => {
            let date_ob = new Date();
            folder.lastDateOut = date_ob;
            folder.lastDateOutUser = req.decoded.id;
            if (folder.firstDateOut === null) {
                folder.firstDateOut = date_ob;
                folder.firstDateOutUser = req.decoded.id;
            }
            folder.save()
                .then((folder) => {
                    return res.send("Folder out");
                })
                .catch((err) => res.status(500).json({ message: 'err in save the last date out.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the folder.' }));
});

//when user click out on the file
router.post("/outFile", VerifyAdminToken, async function (req, res) {
    const fileId = req.body.fileId;
    FileO.findById(fileId)
        .then((file) => {
            let date_ob = new Date();
            file.lastDateOut = date_ob;
            file.lastDateOutUser = req.decoded.id;
            if (file.firstDateOut === null) {
                file.firstDateOut = date_ob;
                file.firstDateOutUser = req.decoded.id;
            }
            file.save()
                .then((file) => {
                    return res.send("File out");
                })
                .catch((err) => res.status(500).json({ message: 'err in save the last date out.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the file.' }));
});



//supperadmin can add a new shulter
router.post("/createDrawers", VerifyAdminToken, async function (req, res) {
    const name = req.body.name;
    const shulter = req.body.shulter;
    const closet = req.body.closet;
    const drawerNumber = req.body.drawerNumber;


    // add new drawer
    const newDrawer = new Drawer({
        name,
        shulter,
        closet,
        drawerNumber
    });

    newDrawer
        .save()
        .then(() => {
            return res.send("Drawer created successfully");
        })
        .catch((err) => res.status(500).json({ message: err }));
});


//supperadmin can add a users to drawer
router.post("/addUsersToDrawer", VerifyAdminToken, async function (req, res) {
    const drawerId = req.body.drawerId;
    const usersList = req.body.usersList;

    Drawer.findById(drawerId).then((drawer) => {
        drawer.usersList = usersList;
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


//get all drawers
router.get("/getAllDrawers",
    VerifyAdminToken,
    async function (req, res, next) {
        const params = req.query;
        await Drawer.find({ closet: params.closet, shulter: params.shulter })
            .then((drawer) => res.json(drawer))
            .catch((err) => res.status(400).json("Error: " + err));

    });
module.exports = router;
