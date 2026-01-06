const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin ,verifyTokenAndDriver  } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/Order.Controllers');


router.post('/', verifyToken , controller.CreateOrder);
router.post('/update/:id', verifyTokenAndDriver , controller.UpdateOrder);
router.post('/admin/update/:id', verifyTokenAndDriver , controller.UpdateOrder);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteOrder);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteOrderFromDb);
router.get('/', verifyTokenAndDriver ,  controller.GetOrders);
router.get('/admin/', verifyTokenAndAdmin ,  controller.GetOrders);
router.get('/me', verifyToken,  controller.GetOrdersMe);
router.get('/find', verifyToken, controller.GetOrderById);
router.post('/Accept/:id' , verifyTokenAndDriver, controller.ReceiveOrder);
router.post('/admin/Accept/:id' , verifyTokenAndAdmin, controller.ReceiveOrder);


module.exports = router;



