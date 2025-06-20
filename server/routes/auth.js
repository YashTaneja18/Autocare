const router = require('express').Router();
const { body } = require('express-validator');
const authCtrl = require('../controllers/auth.controller');

// show forms
router.get('/register', authCtrl.showRegister);
router.get('/login', (_req, res) => res.redirect('/#loginModal'));
router.post('/logout',  authCtrl.logout);

// handle registrations
router.post('/register', [
  body('username').isLength({ min:3, max:20 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min:8 }),
  body('confirm').custom((v,{req}) => v===req.body.password),
  body('phone').isLength({ min:10, max:15 }).isNumeric(),
  body('dob').isDate().withMessage('Invalid date'),
  body('shipping_addr').isLength({ min:5 })
], authCtrl.register);


// handle logins
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authCtrl.login
);

module.exports = router;
