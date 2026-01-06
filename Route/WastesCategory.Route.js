const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const wastesCategoryRoute = require('../Controllers/WasteCategory.Controllers');



router.post('/', verifyToken , wastesCategoryRoute.CreateWasteCategory);
router.post('/update/:id', verifyToken , wastesCategoryRoute.UpdateWasteCategory);
router.delete('/:id',verifyTokenAndAdmin, wastesCategoryRoute.DeleteWasteCategory);
router.delete('/db/:id',verifyTokenAndAdmin, wastesCategoryRoute.DeleteWasteCategoryFromDB);
router.get('/', wastesCategoryRoute.GetWastesCategory);
router.get('/find', wastesCategoryRoute.FindAWasteCategory);


module.exports = router;





