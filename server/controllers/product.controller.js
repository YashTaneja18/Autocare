const pool = require('../models/db');

exports.productPage = async (req, res, next) => {
  const partno = req.params.partno;
  try {
    // 1️⃣ Product core
    const [[product]] = await pool.query(`
      SELECT p.partno, p.name, p.base_price, p.description, p.rating,
             i.image_url, inv.quantity, b.name AS brand,
             c.id AS main_category_id, c.name AS category
      FROM products p
      JOIN images      i   ON i.partno      = p.partno
      JOIN inventory   inv ON inv.partno    = p.partno
      JOIN brands      b   ON b.id          = p.brand_id
      JOIN categories  c   ON c.id          = p.main_category_id
      WHERE p.partno = ?
      LIMIT 1
    `, [partno]);

    if (!product) return res.status(404).render('pages/404', { title: 'Not found' });

    // 2️⃣ Specs
    const [specs] = await pool.query('SELECT `key`, `value` FROM specs WHERE partno = ?', [partno]);

    // 3️⃣ Fitments (vehicle compatibility)
    const [fitments] = await pool.query(`
      SELECT v.make, v.model, v.year
      FROM fitments f
      JOIN vehicles v ON v.id = f.vehicle_id
      WHERE f.partno = ?
    `, [partno]);

    // 4️⃣ Similar products (same category)
    const [similar] = await pool.query(`
      SELECT p.partno, p.name, p.base_price, i.image_url
      FROM products p
      JOIN images i ON i.partno = p.partno
      WHERE p.main_category_id = ? AND p.partno <> ?
      LIMIT 6
    `, [product.main_category_id, partno]);

    // 5️⃣ Render page
    res.render('pages/product', {
      title: product.name,
      activePage:'',
      product,
      specs,
      fitments,
      similar
    });
  } catch (err) {
    next(err);
  }
};