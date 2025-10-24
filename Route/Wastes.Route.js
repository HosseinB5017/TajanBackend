const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const wastesRoute = require('../Controllers/Waste.Controllers');



router.post('/', verifyToken , wastesRoute.CreateWaste);
router.post('/update/:id', verifyToken , wastesRoute.UpdateWaste);
router.delete('/:id',verifyTokenAndAdmin, wastesRoute.DeleteWaste);
router.delete('/db/:id',verifyTokenAndAdmin, wastesRoute.DeleteWasteFromDB);
router.get('/', wastesRoute.GetWastes);
router.get('/find', wastesRoute.FindAWaste);


module.exports = router;





