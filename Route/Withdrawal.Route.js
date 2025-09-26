const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/Withdrawal.Controllers');


router.post('/', verifyToken , controller.RequestWithdrawal);
router.post('/update/:id', verifyToken , controller.UpdateWithdrawal);
router.post('/Accept/:id', verifyToken , controller.ApproveWithdrawal);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteWithdrawal);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteWithdrawalFromDb);
router.get('/', verifyToken,  controller.GetWithdrawals);
router.get('/me', verifyToken,  controller.GetWithdrawalOfUser);
router.get('/find', verifyToken, controller.FoundWithdrawal);


module.exports = router;



