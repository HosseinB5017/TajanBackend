const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require('../Controllers/verifyToken.js');
const UserAddressRoute = require('../Controllers/UserAddress.Controllers');



router.post('/', verifyToken , UserAddressRoute.CreateUserAddress);
router.post('/update', verifyToken , UserAddressRoute.UpdateUserAddress);
router.delete('/:id',verifyTokenAndAdmin, UserAddressRoute.DeleteUserAddress);
router.delete('/db/:id',verifyTokenAndAdmin, UserAddressRoute.DeleteUserAddressFromDB);
router.get('/', UserAddressRoute.GetUserAddress);
router.get('/find', UserAddressRoute.FindAUserAddress);


module.exports = router;





