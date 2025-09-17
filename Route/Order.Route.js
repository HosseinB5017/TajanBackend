const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/Order.Controllers');


router.post('/', verifyToken , controller.CreateOrder);
router.post('/update', verifyToken , controller.UpdateOrder);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteOrder);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteOrderFromDb);
router.get('/', verifyToken,  controller.GetOrders);
router.get('/find', verifyToken, controller.GetOrderById);
router.post('/Accept/:id' , verifyTokenAndAdmin, controller.ReceiveOrder);


module.exports = router;



