const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const cityMediaController = require('../Controllers/CityMedia.Controllers.js');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );

        cb(null,rootDirectory+ "/"+ process.env.CityMediaPath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyTokenAndAdmin , upload.array('images' )  , cityMediaController.CreateCityMedia);
router.delete('/:id',verifyTokenAndAdmin, cityMediaController.DeleteCityMedia);
router.get('/find', cityMediaController.FoundCityMedia);
router.get('/', cityMediaController.GetAllCityMedia);

module.exports = router;





