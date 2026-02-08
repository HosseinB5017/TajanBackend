const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/VerifyToken.js');
const UserAddressRoute = require('../Controllers/UserAddress.Controllers');



router.post('/', verifyToken , UserAddressRoute.CreateUserAddress);
router.post('/update/:id', verifyToken , UserAddressRoute.UpdateUserAddress);
router.delete('/:id',verifyToken, UserAddressRoute.DeleteUserAddress);
router.delete('/db/:id',verifyToken, UserAddressRoute.DeleteUserAddressFromDB);
router.get('/',verifyTokenAndAdmin ,  UserAddressRoute.GetUserAddress);
router.get('/find', verifyToken , UserAddressRoute.FindAUserAddress);
router.get('/me', verifyToken , UserAddressRoute.GetAddressesOfUser);
router.post('/SetUserAddress', verifyToken,  UserAddressRoute.SetActiveUserAddress);


module.exports = router;





