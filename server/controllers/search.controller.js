const pool = require('../models/db');

/* GET /search-suggestions?q=something
   Returns { categories:[{name,slug}], products:[{name,partno}] }
*/
exports.suggestions = async (req, res, next) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ categories: [], products: [] });

  try {
    const like = q + '%';

    const [cats] = await pool.query(
      'SELECT name, slug FROM categories WHERE name LIKE ? ORDER BY name LIMIT 5',
      [like]
    );

    const [prods] = await pool.query(
      'SELECT partno, name FROM products WHERE name LIKE ? ORDER BY name LIMIT 8',
      [like]
    );

    res.json({ categories: cats, products: prods });
  } catch (err) { next(err); }
};

exports.fullResults = async (req, res, next) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.redirect('/');

  try {
    const like = '%' + q + '%';

    const [cats] = await pool.query(
      'SELECT name, slug FROM categories WHERE name LIKE ? ORDER BY name', [like]);
    const [prods] = await pool.query(`
  SELECT p.partno,
         p.name,
         p.base_price,
         (
           SELECT image_url
           FROM images
           WHERE partno = p.partno
           LIMIT 1
         ) AS image_url
  FROM products p
  WHERE p.name LIKE ?
  ORDER BY p.name
  LIMIT 50
`, [like]);


    res.render('pages/search', {
      title: `Results for "${q}"`,
      q,
      categories: cats,
      products: prods,
      activePage: ''       // navbar no highlight
    });
  } catch (err) { next(err); }
};

