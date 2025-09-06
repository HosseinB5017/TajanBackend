const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const sarakhsInfoRoute = require('../Controllers/SarakhsInfo.Controllers');



router.post('/', verifyTokenAndAdmin  , sarakhsInfoRoute.CreateSarakhsInfo);
router.delete('/:id',verifyTokenAndAdmin, sarakhsInfoRoute.DeleteSarakhsInfo);
router.get('/', sarakhsInfoRoute.GetAllSarakhsInfo);

module.exports = router;





