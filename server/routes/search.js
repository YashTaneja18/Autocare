const router = require('express').Router();
const search = require('../controllers/search.controller');

router.get('/search-suggestions', search.suggestions);
router.get('/search', search.fullResults); 

module.exports = router;
