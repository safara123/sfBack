const router = require("express").Router();
var VerifyToken = require("../controllers/AuthController").verifyToken;

let Folder = require("../models/folder.model");
let User = require("../models/user.model");
let FileO = require("../models/file.model");
let Drawer = require("../models/drawer.model");


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
                // .skip(page * size - size)
                // .limit(size)
                .then((drawers) => {

                    res.json({ drawers: drawers, count: limit });
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
        const count = await Drawer.find({ name: {$regex : params.drawerName} }).count();
        const result = await Drawer.find({ name: {$regex : params.drawerName} })
            .populate("folders")
            .populate("usersList")

        res.json({ drawers: result, count: count });
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
