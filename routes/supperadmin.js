const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var verifySupperAdminToken = require("../controllers/AuthController").verifySupperAdminToken;

let Folder = require("../models/folder.model");
let User = require("../models/user.model");
let FileO = require("../models/file.model");
let Drawer = require("../models/drawer.model");



router.post(
    "/register",
    verifySupperAdminToken,
    async function (req, res) {
        const name = req.body.name;
        const password = req.body.password;
        const email = req.body.email;
        const rol = req.body.rol;

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
router.get("/getAllUsers",
    verifySupperAdminToken,
    async function (req, res, next) {
        await User.find()
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });

//get all users
router.get("/getAllFolders",
    verifySupperAdminToken,
    async function (req, res, next) {
        await Folder.find()
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });

router.get("/searchFolders", verifySupperAdminToken, async (req, res) => {
    const params = req.query;
    let page = req.query.page;
    let size = req.query.size;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    const count = await Folder.find({ folderName: params.folderName }).count();
    const result = await Folder.find({ folderName: params.folderName })
    res.json({ folders: result, count: count });
});

//get all the folders in data base by pagination
router.get(
    "/getDrawersPagination",
    verifySupperAdminToken,
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

//get all the folders in data base by pagination
router.get(
    "/getFilesPagination",
    verifySupperAdminToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let folderId = req.query.folderId;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }

        FileO.count({}, function (error, numOfDocs) {
            const limit = numOfDocs;

            FileO.find({ folderId: folderId })
                .skip(page * size - size)
                .limit(size)
                .then((file) => {
                    res.json({ file: file, count: limit });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    }
);


router.get("/searchFiles", verifySupperAdminToken, async (req, res) => {
    const params = req.query;
    let page = req.query.page;
    let size = req.query.size;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    const count = await FileO.find({ fileName: params.fileName }).count();
    const result = await FileO.find({ fileName: params.fileName })
    res.json({ files: result, count: count });
});

//supperadmin can add a new folder to drawer
router.post("/createFolder", verifySupperAdminToken, async function (req, res) {
    const folderName = req.body.folderName;
    const drawer = req.body.drawerId;
    let date_ob = new Date();
    const firstDateIn = date_ob;
    const firstDateOut = null;
    const lastDateIn = date_ob;
    const lastDateOut = null;
    const firstDateInUser = null;
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
                    })
                    .catch((err) => res.status(500).json({ message: err }));
            })
                .catch((err) => res.status(500).json({ message: err }));
            return res.send("Folder created successfully");
        })
        .catch((err) => res.status(500).json({ message: err }));
});

//supperadmin can add a new file
router.post("/createFile", verifySupperAdminToken, async function (req, res) {
    const fileName = req.body.fileName;
    const folderId = req.body.folderId;
    const color = req.body.color;
    let date_ob = new Date();
    const firstDateIn = date_ob;
    const firstDateOut = null;
    const lastDateIn = date_ob;
    const lastDateOut = null;
    const firstDateInUser = null;
    const firstDateOutUser = null;
    const lastDateInUser = null;
    const lastDateOutUser = null;


    // add new file
    const newFile = new FileO({
        fileName,
        color,
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
                    })
                    .catch((err) => res.status(500).json({ message: err }));
            });

            return res.send("File created successfully");
        })
        .catch((err) => res.status(500).json({ message: err }));
});


//when user click in on the folder
router.post("/inFolder", verifySupperAdminToken, async function (req, res) {
    const folderId = req.body.folderId;

    Folder.findById(folderId)
        .then((folder) => {
            let date_ob = new Date();
            folder.lastDateIn = date_ob;
            folder.lastDateInUser = req.decoded.id;
            folder.save()
                .catch((err) => res.status(500).json({ message: 'err in save the last date in.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the folder.' }));
});

//when user click in on the file
router.post("/inFile", verifySupperAdminToken, async function (req, res) {
    const fileId = req.body.fileId;

    FileO.findById(fileId)
        .then((file) => {
            let date_ob = new Date();
            file.lastDateIn = date_ob;
            file.lastDateInUser = req.decoded.id;
            file.save()
                .catch((err) => res.status(500).json({ message: 'err in save the last date in.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the file.' }));
});

//when user click out on the folder
router.post("/outFolder", verifySupperAdminToken, async function (req, res) {
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
                .catch((err) => res.status(500).json({ message: 'err in save the last date out.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the folder.' }));
});

//when user click out on the file
router.post("/outFile", verifySupperAdminToken, async function (req, res) {
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
                .catch((err) => res.status(500).json({ message: 'err in save the last date out.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the file.' }));
});



//supperadmin can add a new shulter
router.post("/createDrawers", verifySupperAdminToken, async function (req, res) {
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
router.post("/addUsersToDrawer", verifySupperAdminToken, async function (req, res) {
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
    verifySupperAdminToken,
    async function (req, res, next) {
        const params = req.query;
        await Drawer.find({ closet: params.closet, shulter: params.shulter })
            .then((drawer) => res.json(drawer))
            .catch((err) => res.status(400).json("Error: " + err));

    });

module.exports = router;
