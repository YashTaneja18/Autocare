const express = require('express');
const router  = express.Router();
const accCtrl = require('../controllers/account.controller');
const { body } = require('express-validator');

// Must be logged in
router.get('/account', accCtrl.accountPage);

router.post('/account/update',
  body('email').isEmail().withMessage('Email invalid'),
  body('phone').isMobilePhone('any'),
  accCtrl.updateProfile
);

module.exports = router;
