// server/routes/pages.js
const router = require('express').Router();
const homeController = require('../controllers/home.controller');

// Home page
router.get('/', homeController.homePage);

// add more routes later (about, contact, etc.)
module.exports = router;
