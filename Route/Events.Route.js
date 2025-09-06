const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const EventsController = require('../Controllers/Events.Controllers.js');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );

        cb(null,rootDirectory+ "/"+ process.env.EventsPath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyTokenAndAdmin , upload.array('images' )  , EventsController.CreateEvents);
router.post('/', verifyTokenAndAdmin, EventsController.UpdateEvents);
router.delete('/:id',verifyTokenAndAdmin, EventsController.DeleteEvents);
router.get('/find', EventsController.FoundEvents);
router.get('/', EventsController.GetAllEvents);

module.exports = router;





