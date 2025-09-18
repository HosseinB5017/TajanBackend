const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const Controller =  require('../Controllers/CityAndState.Controller.js');




router.post('/create', verifyTokenAndAdmin , Controller.createState);
router.post('/createMany', verifyTokenAndAdmin , Controller.insertManyStates);
router.put('/', verifyTokenAndAdmin,Controller.updateStateById);
router.delete('/:id',verifyTokenAndAdmin, Controller.deleteStateById);
router.get('/', Controller.getStateById);
router.get('/all', Controller.getAllStates);


module.exports = router;





