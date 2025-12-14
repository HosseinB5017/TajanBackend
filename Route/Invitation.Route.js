const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const Controller =  require('../Controllers/Invitation.Controllers.js');



router.post('/check', verifyToken , Controller.CheckInvitation);
router.delete('/:id',verifyToken, Controller.DeleteInvitationFriend);
router.get('/all',verifyToken ,Controller.GetInvitationFriends);

module.exports = router;





