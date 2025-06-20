// server/routes/pages.js
const router = require('express').Router();
const homeController = require('../controllers/home.controller');
const catCtrl    = require('../controllers/category.controller');

// Home page
router.get('/', homeController.homePage);
router.get('/category/:slug', catCtrl.categoryPage);

// add more routes later (about, contact, etc.)
module.exports = router;
