const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin ,verifyTokenAndDriver  } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/Order.Controllers');
const serviceOrderController = require('../Controllers/ServiceOrder.Controllers');


router.post('/', verifyToken , controller.CreateOrder);
router.post('/update/:id', verifyTokenAndDriver , controller.UpdateOrder);
router.post('/admin/update/:id', verifyTokenAndDriver , controller.UpdateOrder);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteOrder);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteOrderFromDb);
router.get('/', verifyTokenAndDriver ,  controller.GetOrdersBySortTime);
router.get('/admin/', verifyTokenAndAdmin ,  controller.GetOrders);
router.get('/me', verifyToken,  controller.GetOrdersMe);
router.get('/find', verifyToken, controller.GetOrderById);
router.post('/Accept/:id' , verifyTokenAndDriver, controller.ReceiveOrder);
router.post('/Cancel/:id' , verifyToken, controller.CancelOrder);
router.post('/admin/Accept/:id' , verifyTokenAndAdmin, controller.ReceiveOrder);

// Aliases for Service Orders compatibility (/api/orders/water, /api/orders/bread, etc.)
router.post('/water', verifyToken, serviceOrderController.createWaterOrder);
router.post('/bread', verifyToken, serviceOrderController.createBreadOrder);
router.post('/shop-order', verifyToken, serviceOrderController.createShopOrder);
router.get('/shop/:shopId', verifyToken, serviceOrderController.getShopOrders);
router.get('/service/me', verifyToken, serviceOrderController.getMyServiceOrders);
router.get('/shop-orders/me', verifyToken, serviceOrderController.getMyServiceOrders);

// Single Service Order details by ID (with or without serviceType prefix)
router.get('/service/:id', verifyToken, serviceOrderController.getServiceOrderById);
router.get('/:serviceType/:id', verifyToken, (req, res, next) => {
    // If first param is one of the service types, treat as service order details
    const serviceTypes = ["water", "bread", "restaurant", "supermarket", "shop", "other"];
    if (serviceTypes.includes(req.params.serviceType)) {
        return serviceOrderController.getServiceOrderById(req, res, next);
    }
    next();
});

// Service Order Action Aliases (/api/Order/:id/accept, /api/Order/:id/ready, etc.)
router.post('/:id/accept', verifyToken, serviceOrderController.acceptOrder);
router.post('/:id/ready', verifyToken, serviceOrderController.readyOrder);
router.post('/:id/shipped', verifyToken, serviceOrderController.shippedOrder);
router.post('/:id/delivered', verifyToken, serviceOrderController.deliveredOrder);
router.post('/:id/reject', verifyToken, serviceOrderController.rejectOrder);
router.post('/:id/cancel', verifyToken, serviceOrderController.cancelOrder);

// Service Order Type-specific Action Aliases (/api/Order/water/:id/accept, /api/Order/bread/:id/accept, etc.)
router.post('/:serviceType/:id/accept', verifyToken, serviceOrderController.acceptOrder);
router.post('/:serviceType/:id/ready', verifyToken, serviceOrderController.readyOrder);
router.post('/:serviceType/:id/shipped', verifyToken, serviceOrderController.shippedOrder);
router.post('/:serviceType/:id/delivered', verifyToken, serviceOrderController.deliveredOrder);
router.post('/:serviceType/:id/reject', verifyToken, serviceOrderController.rejectOrder);
router.post('/:serviceType/:id/cancel', verifyToken, serviceOrderController.cancelOrder);

module.exports = router;



