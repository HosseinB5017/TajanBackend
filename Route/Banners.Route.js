const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const BannersController = require('../Controllers/Banners.Controllers.js');



router.post('/', verifyTokenAndAdmin ,  BannersController.CreateBanners);
router.delete('/:id',verifyTokenAndAdmin, BannersController.DeleteEvents);
router.get('/find', BannersController.FoundBanners);
router.get('/', BannersController.GetAllBanners);

module.exports = router;





