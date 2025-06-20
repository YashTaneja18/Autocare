const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.showRegister = (req, res) =>
  res.render('auth/register', { title: 'Register', errors: [], activePage:'' }); 


exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('auth/register', { errors: errors.array() ,title:'Register',activePage:'home'});

  const { username, email, password, phone, dob, shipping_addr } = req.body;

  // hash password
  const hash = await bcrypt.hash(password, 12);

  try {
    await pool.query(
    `INSERT INTO users
    (username,email,password_hash,phone,dob,shipping_addr)
    VALUES (?,?,?,?,?,?)`,
    [username,email,hash,phone,dob,shipping_addr]
    );
     // auto‑login newly registered user
     req.session.user = { username, id: this.insertId };
     req.session.save(err => {
  if (err) return next(err);
  res.json({ success: true });          // ✅ send 200 JSON
});
     res.redirect('/');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('auth/register', { errors: [{ msg: 'Email or username exists' }], title:'Register',activePage:'home' });
    }
    throw err;
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, msg: 'Invalid input' });

  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ success: false, msg: 'Login failed' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, msg: 'Login failed' });

    req.session.user = { id: user.id, username: user.username };

req.session.save(async err => {
  if (err) return next(err);

  /* ------ merge guest cart → DB ------ */
  if (req.session.cart && req.session.cart.length) {
    const cartCtrl = require('./cart.controller');
    await cartCtrl.saveCart(req, req.session.cart); // uses same helper
    delete req.session.cart;
  }
  res.json({success:true});        // or res.json({success:true}) if you use AJAX login
});

  } catch (e) { next(e); }
};


exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
