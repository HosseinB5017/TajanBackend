const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const TicketController = require('../Controllers/Tickets.Controllers.js');


const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootDirectory = path.join(__dirname, '../' );

        cb(null,rootDirectory+ "/"+ process.env.ticketFiles);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 18}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/', verifyToken ,upload.fields([{name : 'files',maxCount : 3}])  , TicketController.CreateTicketsModel);
router.delete('/:id',verifyToken, TicketController.DeleteTicketsModel);
router.get('/find',verifyToken, TicketController.FoundTicketsModel);
router.get('/admin/find',verifyTokenAndAdmin, TicketController.FoundAdminTicketsModel);
router.get('/my',verifyToken, TicketController.GetMyAllTicketsModel);
router.get('/',verifyTokenAndAdmin, TicketController.GetAllTicketsModel);
router.post('/Edit/:id',verifyTokenAndAdmin, TicketController.EditTicketsModel);
router.post('/Message/UserResponse/:id',verifyToken, TicketController.AddUserResponse);
router.post('/Message/AdminResponse/:id',verifyTokenAndAdmin, TicketController.AddSupportResponse);

module.exports = router;





