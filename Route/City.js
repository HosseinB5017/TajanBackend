const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const Controller =  require('../Controllers/CityAndState.Controller.js');




router.post('/create', verifyTokenAndAdmin , Controller.createCity);
router.post('/createMany', verifyTokenAndAdmin , Controller.insertManyCities);
router.put('/', verifyTokenAndAdmin,Controller.updateCityById);
router.delete('/:id',verifyTokenAndAdmin, Controller.deleteCityById);
router.get('/', Controller.getCityById);
router.get('/all', Controller.getAllCities);

module.exports = router;





