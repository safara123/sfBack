const router = require("express").Router();
var VerifyToken = require("../controllers/AuthController").verifyToken;

let Folder = require("../models/Folder.model");
let User = require("../models/User.model");
let FileO = require("../models/File.model");
let Drawer = require("../models/Drawer.model");


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

//when user click in on the folder
router.post("/inFolder", VerifyToken, async function (req, res) {
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
router.post("/inFile", VerifyToken, async function (req, res) {
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
                .catch((err) => res.status(500).json({ message: 'err in save the last date out.' }));
        })
        .catch((err) => res.status(500).json({ message: 'err in find the file.' }));
});

module.exports = router;
