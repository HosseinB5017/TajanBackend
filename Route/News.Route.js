const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const NewsController = require('../Controllers/News.Controllers.js');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );
        cb(null,rootDirectory +"/" + process.env.NewsPath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyTokenAndAdmin , upload.array('images' )  , NewsController.CreateNews);
router.post('/update', verifyTokenAndAdmin, upload.array('images' ) ,NewsController.UpdateNews);
router.delete('/:id',verifyTokenAndAdmin, NewsController.DeleteNews);
router.get('/find', NewsController.FoundNews);
router.get('/', NewsController.GetAllNews);



module.exports = router;





