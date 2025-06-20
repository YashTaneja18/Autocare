const express = require('express');
const router  = express.Router();
const productCtrl = require('../controllers/product.controller');

// /product/:partno
router.get('/product/:partno', productCtrl.productPage);

module.exports = router;