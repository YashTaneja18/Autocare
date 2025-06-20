const pool = require('../models/db');

/**
 * GET /category/:slug
 * Query params:
 *   brand   (array or single id) ?brand=1&brand=3
 *   inStock (1 or 0)
 *   min     (price)
 *   max     (price)
 *   sort    (price_asc | price_desc | rating_desc)
 */
exports.categoryPage = async (req, res, next) => {
  try {
    const { slug }  = req.params;
    const q         = req.query;

    /* ── 1. Get category metadata ─────────────────────── */
    const [[category]] = await pool.query(
      'SELECT id, name FROM categories WHERE slug = ?', [slug]
    );
    if (!category) return res.status(404).render('pages/404', { title: 'Not found' });

    /* ── 2. Get distinct brands for this category ─────── */
    const [brandRows] = await pool.query(
      `SELECT DISTINCT b.id, b.name
         FROM products p
         JOIN brands b ON p.brand_id = b.id
        WHERE p.main_category_id = ?
        ORDER BY b.name`, [category.id]
    );

    /* ── 3. Build dynamic WHERE clause ------------------ */
    const conditions = ['p.main_category_id = ?'];
    const params     = [category.id];

    // brand filter (array or single)
    let selectedBrands = [];
    if (q.brand) {
      selectedBrands = Array.isArray(q.brand) ? q.brand : [q.brand];
      conditions.push(`p.brand_id IN (${selectedBrands.map(()=> '?').join(',')})`);
      params.push(...selectedBrands);
    }

    // stock filter
    if (q.inStock === '1') {
      conditions.push('IFNULL(inv.quantity,0) > 0');
    } else if (q.inStock === '0') {
      conditions.push('IFNULL(inv.quantity,0) = 0');
    }

    // price range
    if (q.min) { conditions.push('p.base_price >= ?'); params.push(Number(q.min)); }
    if (q.max) { conditions.push('p.base_price <= ?'); params.push(Number(q.max)); }

    // assemble WHERE
    const whereSql = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // sort
    let orderSql = '';
    switch (q.sort) {
      case 'price_asc':   orderSql = 'ORDER BY p.base_price ASC'; break;
      case 'price_desc':  orderSql = 'ORDER BY p.base_price DESC'; break;
      case 'rating_desc': orderSql = 'ORDER BY p.rating DESC'; break;
      default:            orderSql = ''; 
    }

    /* ── 4. Fetch filtered products --------------------- */
    const [products] = await pool.query(`
      SELECT 
        p.partno, p.name, p.base_price AS price, p.rating,
        b.name AS brand,
        inv.quantity,
        ( SELECT image_url FROM images WHERE partno = p.partno LIMIT 1 ) AS image_url
      FROM products p
      LEFT JOIN brands b  ON b.id = p.brand_id
      LEFT JOIN inventory inv ON inv.partno = p.partno
      ${whereSql}
      ${orderSql}
    `, params);

    /* ── 5. Render page --------------------------------- */
    res.render('pages/category', {
      title:        `${category.name} – Autocare`,
      category,
      activePage: '',
      products,
      brandsList:   brandRows,
      selectedBrands,
      filters:      q,
      user:         req.session.user,
      cartCount:    req.session.cart?.length || 0
    });
  } catch (err) {
    next(err);
  }
};
