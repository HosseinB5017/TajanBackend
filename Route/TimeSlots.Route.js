const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/TimeSlot.Controllers');



router.post('/', verifyTokenAndAdmin , controller.CreateTimeSlot);
router.post('/update/:id', verifyTokenAndAdmin , controller.UpdateTimeSlot);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteTimeSlot);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteSlotTimesFromDB);
router.get('/',verifyToken , controller.GetAllTimeSlots);
router.get('/validTimes' ,verifyToken, controller.GetTimeSlots);
router.get('/find' , verifyToken, controller.GetTimeSlotById);


module.exports = router;





