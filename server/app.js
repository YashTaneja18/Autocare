// server/app.js
require('dotenv').config();
const path          = require('path');
const express       = require('express');
const engine        = require('ejs-mate');
const session       = require('express-session');
const MySQLStore    = require('express-mysql-session')(session);
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');
const csurf         = require('csurf');

const pool          = require('./models/db');      // existing MySQL2 promise pool
const pageRoutes    = require('./routes/pages');
const authRoutes    = require('./routes/auth');    // new auth router
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');

const app = express();

/* ─────────────────  VIEW ENGINE  ───────────────── */
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

/* ─────────────────  SECURITY HEADERS  ───────────── */
app.use(helmet());

/* ─────────────────  STATIC ASSETS  ──────────────── */
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ─────────────────  BODY PARSING  ───────────────── */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());                     // if you need JSON APIs

/* ─────────────────  RATE‑LIMIT auth endpoints ───── */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 10                      // 10 requests per IP
});
app.use(['/login', '/register'], authLimiter);

/* ─────────────────  SESSION STORE  ─────────────── */
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env;

app.use(session({
  store: new MySQLStore({
    host:     DB_HOST,
    user:     DB_USER,
    password: DB_PASS,
    database: DB_NAME
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(async (req, res, next) => {
  try {
    let count = 0;
    if (req.session.user) {
      // Logged-in: count items in DB cart
      const [[row]] = await pool.query(
        'SELECT COALESCE(SUM(qty), 0) AS cnt FROM cart_items WHERE user_id = ?',
        [req.session.user.id]
      );
      count = row.cnt;
    } else if (req.session.cart) {
      // Guest: count session cart
      count = req.session.cart.reduce((sum, item) => sum + item.qty, 0);
    }
    res.locals.cartCount = count;
    next();
  } catch (err) {
    next(err);
  }
});

/* ─────────────────  CSRF PROTECTION  ───────────── */
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();              // already there
  res.locals.user      = req.session.user || null;     // already there
  res.locals.cartCount = req.session.cart
                       ? req.session.cart.length
                       : 0;                            // 👈 NEW
  next();
});
app.use((req, res, next) => {
  res.locals.formErrors = req.session.formErrors || [];
  delete req.session.formErrors;
  next();
});

/* ─────────────────  ROUTES  ────────────────────── */
app.use('/', authRoutes);
app.use('/', pageRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);

/* ─────────────────  404 handler  ───────────────── */


/* ─────────────────  GLOBAL ERROR HANDLER  ──────── */
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  res.status(500).send('Server error');
});

/* ─────────────────  START SERVER  ──────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready → http://localhost:${PORT}`));
