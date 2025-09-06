const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const mayorInfoRoute = require('../Controllers/MayorInfo.Controllers.js');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );
        cb(null,rootDirectory+ "/"+ process.env.mayorPath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyTokenAndAdmin , upload.single('image' )  , mayorInfoRoute.CreateMayorInfo);
router.delete('/:id',verifyTokenAndAdmin, mayorInfoRoute.DeleteMayor);
router.get('/', mayorInfoRoute.GetAllMayor);

module.exports = router;





