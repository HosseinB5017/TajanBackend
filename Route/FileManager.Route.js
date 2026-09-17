const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const userController = require('../Controllers/FileManager.Controller');
const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );
        cb(null,rootDirectory+"/" + process.env.filePath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/uploadFile', upload.single('file'), userController.UploadFile);
router.post('/uploadFiles',verifyToken,  upload.fields([{name : 'files' , maxCount : 20}]), userController.UploadFiles);
router.get('/find', userController.FindAFiles);
router.delete('/:id',verifyTokenAndAdmin, userController.DeleteFile);
router.delete('/db/:id',verifyTokenAndAdmin, userController.DeleteFileFromDb);
router.get('/',verifyTokenAndAdmin, userController.GetAllFiles);


module.exports = router;
