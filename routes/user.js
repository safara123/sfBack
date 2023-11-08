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
        const drawerId = req.query.drawerId;
        await Folder.find({ drawer: drawerId })
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
            let limit = numOfDocs;
            let count = 0;
            Drawer.find()
                .populate("folders")
                .populate("usersList")
                .then((drawers) => {
                    let userDrawers = []
                    drawers.forEach((drawer) => {
                        if (includeInList(drawer.usersList, req.decoded.id)) {
                            userDrawers.push(drawer);
                            count = count + 1
                        }
                        else {
                            limit = limit - 1;
                        }
                    })
                    res.json({ drawers: userDrawers, count: count });
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
        let count = await Drawer.find({ name: { $regex: params.drawerName, $options: 'i' } }).count();
        const result = await Drawer.find({ name: { $regex: params.drawerName, $options: 'i' } })
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
    "/getFoldersPagination",
    VerifyToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let drawerId = req.query.drawerId;
        let userId = req.decoded.id;

        if (!drawerId) {
            res.json({ folder: null });
        }
        if (drawerId == "folders") {
            User.findById(userId)
                .populate("drawersAccess")
                .then((users) => {
                    let foldersList = [];
                    users.drawersAccess.map((drawer) => {
                        foldersList.push(...drawer.folders);
                    })

                    Folder.find({ _id: { $in: foldersList } })
                        .count({}, function (error, numOfDocs) {
                            const limit1 = numOfDocs;
                            Folder.find({ _id: { $in: foldersList } })
                                .populate("drawer")
                                .populate("firstDateInUser")
                                .populate("firstDateOutUser")
                                .populate("lastDateInUser")
                                .populate("lastDateOutUser")
                                .then((folders) => {
                                    res.json({ folder: folders, count: limit1 });
                                })
                                .catch((err) => res.status(500).json("Error: " + err));
                        });
                })
                .catch((err) => res.status(400).json("Error: " + err));
            return;
        }

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }
        Folder.find({ drawer: drawerId }).count({}, function (error, numOfDocs) {
            const limit = numOfDocs;

            Folder.find({ drawer: drawerId })
                .populate("drawer")
                .populate("firstDateInUser")
                .populate("firstDateOutUser")
                .populate("lastDateInUser")
                .populate("lastDateOutUser")
                .skip(page * size - size)
                .limit(size)
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
    let drawerId = req.query.drawerId;
    let userId = req.decoded.id;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    if (drawerId == "folders") {
        User.findById(userId)
            .populate("drawersAccess")
            .then((users) => {
                let foldersList = [];
                users.drawersAccess.map((drawer) => {
                    foldersList.push(...drawer.folders);
                })

                Folder.find({ _id: { $in: foldersList }, folderName: { $regex: params.folderName, $options: 'i' } })
                    .count({}, function (error, numOfDocs) {
                        const limit1 = numOfDocs;
                        Folder.find({ _id: { $in: foldersList }, folderName: { $regex: params.folderName, $options: 'i' } })
                            .populate("drawer")
                            .populate("firstDateInUser")
                            .populate("firstDateOutUser")
                            .populate("lastDateInUser")
                            .populate("lastDateOutUser")
                            .then((folders) => {
                                res.json({ folders: folders, count: limit1 });
                            })
                            .catch((err) => res.status(500).json("Error: " + err));
                    });
            })
            .catch((err) => res.status(400).json("Error: " + err));

        return;
    }
    const count = await Folder.find({ $and: [{ drawer: drawerId }, { folderName: { $regex: params.folderName, $options: 'i' } }] }).count();
    const result = await Folder.find({ $and: [{ drawer: drawerId }, { folderName: { $regex: params.folderName, $options: 'i' } }] })
        .skip(page * size - size)
        .limit(size)
    res.json({ folders: result, count: count });
});

router.get("/getFoldersPaginationPage", VerifyToken, async function (req, res) {
    let page = req.query.page;
    let size = req.query.size;
    let folderName = req.query.folderName; // Add this line to get folderName parameter


    try {
        const userD = await User.findById(req.decoded.id).exec();
        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }

        let filter = {}; // Initialize an empty filter object

        if (folderName && folderName.trim() !== "") {
            // If folderName is provided and not empty, create a regex pattern to match folders
            filter = { folderName: { $regex: new RegExp(folderName, "i") } };
        }

        Folder.countDocuments(filter, function (error, numOfDocs) {
            const limit = numOfDocs;
            Folder.find(filter)
                .populate("drawer")
                .populate("firstDateInUser")
                .populate("firstDateOutUser")
                .populate("lastDateInUser")
                .populate("lastDateOutUser")
                .then((folders) => {
                    const userDrawerAccess = userD ? (userD.drawersAccess || []) : [];
                    const filteredFolders = folders.filter(folder => {
                        return userDrawerAccess.includes(folder && folder.drawer && folder.drawer._id && folder.drawer._id.toString());
                    });

                    res.json({ folders: filteredFolders, count: filteredFolders.length });
                })
                .catch((err) => res.status(400).json("Error: " + err));
        });
    } catch (error) {
        console.error(error);
    }
});

//get all the folders in data base by pagination
router.get(
    "/getFilesPaginationPage",
    VerifyToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let fileName = req.query.fileName; // Add this line to get folderName parameter
        try {
            const userD = await User.findById(req.decoded.id).exec();
            if (page === undefined || size === undefined) {
                page = 1;
                size = 6;
            }
            let filter = {}; // Initialize an empty filter object

            if (fileName && fileName.trim() !== "") {
                // If folderName is provided and not empty, create a regex pattern to match folders
                filter = { fileName: { $regex: new RegExp(fileName, "i") } };
            }

            FileO.countDocuments(filter, function (error, numOfDocs) {
                const limit = numOfDocs;

                FileO.find(filter)
                    .populate("folderId")
                    .populate("firstDateInUser")
                    .populate("firstDateOutUser")
                    .populate("lastDateInUser")
                    .populate("lastDateOutUser")
                    .populate({
                        path: 'folderId',
                        populate: {
                            path: 'drawer'
                        }
                    })
                    .then((files) => {

                    const userDrawerAccess = userD ? (userD.drawersAccess || []) : [];
                    const filteredFiles = files.filter(file => {
                        return userDrawerAccess.includes(file && file.folderId && file.folderId.drawer && file.folderId.drawer._id && file.folderId.drawer._id.toString());
                    });

                        res.json({ files: filteredFiles, count: filteredFiles.length });
                    })
                    .catch((err) => res.status(400).json("Error: " + err));
            });
        } catch (error) {
            console.error(error);
        }

    }

);


//get all the folders in data base by pagination
router.get(
    "/getFilesPagination",
    VerifyToken,
    async function (req, res) {
        let page = req.query.page;
        let size = req.query.size;
        let folderId = req.query.folderId;
        let userId = req.decoded.id;

        if (page === undefined || size === undefined) {
            page = 1;
            size = 6;
        }
        if (!folderId) {
            res.json({ file: null });
        }
        if (folderId === "files") {
            User.findById(userId)
                .populate("drawersAccess")
                .then((users) => {
                    let foldersList = [];
                    users.drawersAccess.map((drawer) => {
                        foldersList.push(...drawer.folders);
                    })

                    Folder.find({ _id: { $in: foldersList } })
                        .count({}, function (error, numOfDocs) {
                            const limit1 = numOfDocs;
                            Folder.find({ _id: { $in: foldersList } })
                                .populate("files")
                                .then((folders) => {
                                    let filesList = [];
                                    folders.map((folder) => {
                                        filesList.push(...folder.files);
                                    })
                                    res.json({ file: filesList, count: filesList.length });
                                })
                                .catch((err) => res.status(500).json("Error: " + err));
                        });
                })
                .catch((err) => res.status(400).json("Error: " + err));

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
                .skip(page * size - size)
                .limit(size)
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
    let folderId = req.query.folderId;
    let userId = req.decoded.id;

    if (page === undefined || size === undefined) {
        page = 1;
        size = 6;
    }
    if (folderId === "files") {
        User.findById(userId)
            .populate("drawersAccess")
            .then((users) => {
                let foldersList = [];
                users.drawersAccess.map((drawer) => {
                    foldersList.push(...drawer.folders);
                })

                Folder.find({ _id: { $in: foldersList } })
                    .count({}, function (error, numOfDocs) {
                        const limit1 = numOfDocs;
                        Folder.find({ _id: { $in: foldersList } })
                            .populate("files")
                            .then((folders) => {
                                let filesList = [];

                                folders.map((folder) => {
                                    folder.files.map((file) => {
                                        if (file.fileName.includes(params.fileName)) {
                                            filesList.push(file);
                                        }
                                    })
                                })
                                res.json({ files: filesList, count: filesList.length });
                            })
                            .catch((err) => res.status(500).json("Error: " + err));
                    });
            })
            .catch((err) => res.status(400).json("Error: " + err));
        return;
    }

    const count = await FileO.find({ $and: [{ folderId: folderId }, { fileName: { $regex: params.fileName, $options: 'i' } }] }).count();
    const result = await FileO.find({ $and: [{ folderId: folderId }, { fileName: { $regex: params.fileName, $options: 'i' } }] })
        .skip(page * size - size)
        .limit(size)

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
    const attachment = req.body.attachment;
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

router.post("/editDrawerName", VerifyToken, async function (req, res) {
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

router.post("/editFolderName", VerifyToken, async function (req, res) {
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

router.post("/editFileName", VerifyToken, async function (req, res) {
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

router.post("/editDrawerNumber", VerifyToken, async function (req, res) {
    const drawerNumber = req.body.drawerNumber;
    const drawerId = req.body.drawerId;

    Drawer.findById(drawerId).then((drawer) => {
        drawer.drawerNumber = drawerNumber;
        drawer.save()
            .then(() => {
                return res.send("drawer number edited successfully");
            })
            .catch((err) => res.status(200).json({ message: err }));
    });
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
