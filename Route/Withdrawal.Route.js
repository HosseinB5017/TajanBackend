const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const controller = require('../Controllers/Withdrawal.Controllers');


router.post('/', verifyToken , controller.RequestWithdrawal);
router.post('/update/:id', verifyTokenAndAdmin , controller.UpdateWithdrawal);
router.post('/Accept/:id', verifyTokenAndAdmin , controller.ApproveWithdrawal);
router.delete('/:id',verifyTokenAndAdmin, controller.DeleteWithdrawal);
router.delete('/db/:id',verifyTokenAndAdmin, controller.DeleteWithdrawalFromDb);
router.get('/', verifyToken,  controller.GetWithdrawals);
router.get('/me', verifyToken,  controller.GetWithdrawalOfUser);
router.get('/find', verifyToken, controller.FoundWithdrawal);
router.get('/:id', verifyToken, controller.GetWithdrawalById);


module.exports = router;



