const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const userController = require('../Controllers/user.Controllers');
//const erorrs = require("http-errors");
const authController = require('../Controllers/auth.Controllers');

const multer = require('multer');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const path = require('path');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UserDownPath);
    },
    filename: function (req, file, cb) {
        const rnd = new ShortUniqueId({length: 10}).randomUUID();
        req.name = "HB" + rnd + file.originalname;
        cb(null, "HB" + rnd + file.originalname);
    }
});
var upload = multer({storage: storage});



router.post('/auth/verifyOtpCode', authController.VerifyOtpUser);
router.post('/auth/LoginUser', authController.LoginAndRegisterUser);
router.post('/auth/register', authController.RegisterUser);
router.post('/auth/login', authController.LoginUser);///admin
router.post('/userInfo',verifyToken ,userController.UserInfo);///admin
router.put('/',verifyToken, userController.UpdateUser);
router.post('/updateProfile' , verifyToken ,upload.single('image'), userController.UpdateProfile);
router.delete('/:id',verifyTokenAndAdmin, userController.DeleteUser);
router.get('/find',verifyTokenAndAdmin, userController.FindUser);
router.get('/',verifyTokenAndAdmin, userController.GetAllUsers);



module.exports = router;








