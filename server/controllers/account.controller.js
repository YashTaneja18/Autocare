const pool = require('../models/db');
const { validationResult } = require('express-validator');

/* GET /account ---------------------------------------------------------- */
exports.accountPage = async (req, res, next) => {
  if (!req.session.user) return res.redirect('/#loginModal');

  try {
    const [[user]] = await pool.query(
      'SELECT username, email, phone, shipping_addr, dob FROM users WHERE id = ?',
      [req.session.user.id]
    );

    const [orders] = await pool.query(
      `SELECT id,
              DATE_FORMAT(created_at,'%d %b %Y') AS date,
              status,
              total
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [req.session.user.id]
    );

    res.render('pages/account', {
      title: 'My Account',
      activePage: 'account',   // for navbar highlight
      user,
      orders
    });
  } catch (err) { next(err); }
};

/* POST /account/update -------------------------------------------------- */
exports.updateProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success:false, msg: errors.array()[0].msg });

  const { username, email, phone, address, dob } = req.body;

  try {
    await pool.query(
      'UPDATE users SET username=?, email=?, phone=?, shipping_addr=?, dob=? WHERE id=?',
      [username, email, phone, address, dob || null, req.session.user.id]
    );
    req.session.user.username = username; 
    res.json({ success:true });
  } catch (err) { next(err); }
};
