const express = require('express');
const router  = express.Router();
const cartCtrl = require('../controllers/cart.controller');

router.get('/cart',            cartCtrl.viewCart);
router.post('/cart/add',       cartCtrl.addToCart);
router.post('/cart/update',    cartCtrl.updateQty);   // qty +/-
router.post('/cart/remove',    cartCtrl.removeItem);
router.post('/checkout',       cartCtrl.checkout);     // -> shipping page

module.exports = router;