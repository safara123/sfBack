const router = require("express").Router();
var VerifyToken = require("../controllers/AuthController").verifyToken;
var includeInList = require("../controllers/AuthController").includeInList;


let Folder = require("../models/folder.model");
let User = require("../models/user.model");
let FileO = require("../models/file.model");
let Drawer = require("../models/drawer.model");


//get all users
router.get("/getAllFolders",
    VerifyToken,
    async function (req, res, next) {
        await Folder.find()
            .populate("drawer")
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));

    });


router.post('/deleteDrawer', VerifyToken, async function (req, res, next) {
    const drawerId = req.body.drawerId;
    await Drawer.findById(drawerId)
        .then((drawer) => {
            drawer.remove();
            res.json("drawer deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));

})

router.post('/deleteFolder', VerifyToken, function (req, res, next) {
    const folderId = req.body.folderId;
    Folder.findById(folderId)
        .then((folder) => {
            folder.remove();
            res.json("folder deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));
})

router.post('/deleteFile', VerifyToken, function (req, res, next) {
    const fileId = req.body.fileId;
    FileO.findById(fileId)
        .then((file) => {
            file.remove();
            res.json("file deleted successfully")
        })
        .catch((err) => res.status(400).json("Error: " + err));
})


//get all the folders in data base by pagination
router.get(
    "/getDrawersPagination",
    VerifyToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }

        Drawer.count({}, function (error, numOfDocs) {
            var limit = numOfDocs;

            Drawer.find()
                .populate("folders")
                .populate("usersList")
                .skip(page * size - size)
                .limit(size)
                .then((drawers) => {
                    let userDrawers = []
                    drawers.forEach((drawer) => {
                        if (includeInList(drawer.usersList, req.decoded.id)) {
                            userDrawers.push(drawer);
                        }
                        else {
                            limit = limit - 1;
                        }
                    })
                    res.json({ drawers: userDrawers, count: limit });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    }
);

router.get("/searchDrawers",
    VerifyToken, async (req, res) => {
        const params = req.query;
        let page = req.query.page;
        let size = req.query.size;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }
        var count = await Drawer.find({ name: { $regex: params.drawerName } }).count();
        const result = await Drawer.find({ name: { $regex: params.drawerName } })
            .populate("folders")
            .populate("usersList")

        let userDrawers = []
        result.forEach((drawer) => {
            if (includeInList(drawer.usersList, req.decoded.id)) {
                userDrawers.push(drawer);
            }
            else {
                count = count - 1;
            }
        })
        res.json({ drawers: userDrawers, count: count });
    });

//get all the folders in data base by pagination
router.get(
    "/getFilesPagination",
    VerifyToken,
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
    }
);


router.get("/searchFiles", VerifyToken, async (req, res) => {
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



//supperadmin can add a new folder to drawer
router.post("/createFolder", VerifyToken, async function (req, res) {
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

//supperadmin can add a new file
router.post("/createFile", VerifyToken, async function (req, res) {
    const fileName = req.body.fileName;
    const folderId = req.body.folderId;
    const color = req.body.color;
    let date_ob = new Date();
    const firstDateIn = date_ob;
    const firstDateOut = null;
    const lastDateIn = date_ob;
    const lastDateOut = null;
    const firstDateInUser = req.decoded.id;;
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
                        res.send("File created successfully");
                    })
                    .catch((err) => res.status(500).json({ message: err }));
            });

        })
        .catch((err) => res.status(500).json({ message: err }));
});

//get all drawers
router.get("/getAllDrawers",
    VerifyToken,
    async function (req, res, next) {
        const params = req.query;
        await Drawer.find({ closet: params.closet, shulter: params.shulter })
            .populate("usersList")
            .then((drawer) => {
                let userDrawers = []
                drawer.map((d) => {
                    if (includeInList(d.usersList, req.decoded.id)) {
                        userDrawers.push(d);
                    }
                })
                res.json(userDrawers)
            })
            .catch((err) => res.status(400).json("Error: " + err));

    });

//get all the folders in data base by pagination
router.get(
    "/getFoldersPagination",
    VerifyToken,
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


router.get("/searchFolders", VerifyToken, async (req, res) => {
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


//when user click in on the folder
router.post("/inFolder", VerifyToken, async function (req, res) {
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
router.post("/inFile", VerifyToken, async function (req, res) {
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
router.post("/outFolder", VerifyToken, async function (req, res) {
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
router.post("/outFile", VerifyToken, async function (req, res) {
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

module.exports = router;
