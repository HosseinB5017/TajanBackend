const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const ServicesRoute = require('../Controllers/Services.Controllers');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );
        cb(null,rootDirectory+ "/"+ process.env.ServicePath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();

        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyTokenAndAdmin  , upload.fields([{ name: 'image', maxCount: 1 }, { name: 'files', maxCount: 8 }]) , ServicesRoute.CreateService);
router.delete('/:id',verifyTokenAndAdmin, ServicesRoute.DeleteService);
router.get('/', ServicesRoute.GetAllServices);
router.get('/find', ServicesRoute.FindService);


module.exports = router;





