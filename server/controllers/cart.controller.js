const pool = require('../models/db');

async function getCartCount(req) {
  if (req.session.user) {
    const [[row]] = await pool.query(
      'SELECT COALESCE(SUM(qty), 0) AS cnt FROM cart_items WHERE user_id = ?',
      [req.session.user.id]
    );
    return row.cnt;
  } else {
    return (req.session.cart || []).reduce((sum, i) => sum + i.qty, 0);
  }
}

// helper — load merged cart (db if logged‑in, else session)
async function loadCart(req) {
  if (req.session.user) {
    const [rows] = await pool.query(
      'SELECT partno, qty FROM cart_items WHERE user_id = ?',
      [req.session.user.id]
    );
    return rows; // [{partno, qty}]
  }
  return req.session.cart || [];
}

// helper — save cart (db for user, session for guest)
async function saveCart(req, cart) {
  if (req.session.user) {
    // Upsert each row, simpler loop for clarity
    for (const item of cart) {
      await pool.query(
        `INSERT INTO cart_items (user_id, partno, qty)
         VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE qty = VALUES(qty)`,
        [req.session.user.id, item.partno, item.qty]
      );
    }
  } else {
    req.session.cart = cart;
  }
}

exports.addToCart = async (req, res, next) => {
  const { partno, qty = 1 } = req.body;
  try {
    const cart = await loadCart(req);
    const found = cart.find(i => i.partno === partno);
    if (found) found.qty += Number(qty);
    else cart.push({ partno, qty: Number(qty) });
    await saveCart(req, cart);

    // ✨  respond JSON instead of redirect
    return res.json({ success: true, cartCount: await getCartCount(req) });
  } catch (e) { next(e); }
};

exports.viewCart = async (req, res, next) => {
  try {
    const cart = await loadCart(req);
    if (!cart.length) return res.render('pages/cart', { title: 'Your Cart', items: [],activePage:'' });

    const partnos = cart.map(i => i.partno);
    const [rows] = await pool.query(
      `SELECT p.partno, p.name, p.base_price, i.image_url
       FROM products p JOIN images i ON i.partno = p.partno
       WHERE p.partno IN (?)`, [partnos]);

    const items = rows.map(p => {
      const c = cart.find(x => x.partno === p.partno);
      return { ...p, qty: c.qty, subtotal: p.base_price * c.qty };
    });
    const total = items.reduce((s,it)=>s+it.subtotal,0);
    res.render('pages/cart', { title: 'Your Cart', items, total, activePage:'' });
  } catch (e) { next(e); }
};

exports.updateQty = async (req, res, next) => {
  try {
    const { partno, qty } = req.body;
    const cart = await loadCart(req);
    const it   = cart.find(i => i.partno === partno);
    if (it) it.qty = Math.max(1, Number(qty));
    await saveCart(req, cart);
    res.json({ success: true, cartCount: await getCartCount(req) });
  } catch (e) { next(e); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { partno } = req.body;

    if (req.session.user) {
      // Logged‑in → remove directly from DB
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = ? AND partno = ?',
        [req.session.user.id, partno]
      );
    } else {
      // Guest → remove from session cart array
      req.session.cart = (req.session.cart || []).filter(i => i.partno !== partno);
    }

    // fresh count
    const cartCount = await getCartCount(req);
    return res.json({ success: true, cartCount });
  } catch (err) { next(err); }
};


exports.checkout = (req, res) => {
  if (!req.session.user) return res.redirect('/#loginModal');
  res.redirect('/shipping');
};

// When user logs in, merge guest session cart → DB
exports.mergeGuestCart = async (req, _res, next) => {
  if (req.session.user && req.session.cart && req.session.cart.length) {
    await saveCart(req, req.session.cart);
    delete req.session.cart;
  }
  next();
};

/* ----------------- EXPORT HELPERS ----------------- */
module.exports.saveCart   = saveCart;   // <— this line
module.exports.loadCart   = loadCart;   // (optional but handy elsewhere)
module.exports.getCartCount = getCartCount; // (if you created that helper)
