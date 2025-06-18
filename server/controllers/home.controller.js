// controllers/home.controller.js
const pool = require('../models/db');

exports.homePage = async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      'SELECT name, slug, image_url FROM categories ORDER BY id'
    );

    const [heroRows] = await pool.query(
      'SELECT image_url AS img, name, price, short_desc AS descp FROM offers LIMIT 10'
    );

    res.render('pages/home', {
      title:      'Home – Autocare',
      activePage: 'home',
      products:   heroRows,
      categories,              // ← one array, no splitting
      user:       req.session.user,
      cartCount:  req.session.cart?.length || 0,
      initialVisible: 5       // how many cats to show before “View More”
    });
  } catch (err) {
    next(err);
  }
};
