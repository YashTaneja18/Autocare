const pool = require('../models/db');          // your MySQL pool

exports.homePage = async (req, res, next) => {
  try {
    /* sample schema:  id | image_url | name | price | short_desc */
    const [rows] = await pool.query(
      'SELECT image_url AS img, name, price, short_desc AS descp FROM offers LIMIT 10'
    );

    res.render('pages/home', {
      title:       'Home – Autocare',
      activePage:  'home',
      products:    rows,               // ← pass to view
      user:        req.session.user,
      cartCount:   req.session.cart?.length || 0
    });
  } catch (err) {
    next(err);
  }
};
