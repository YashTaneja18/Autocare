// server/app.js
require('dotenv').config();
const path   = require('path');
const express = require('express');
const engine  = require('ejs-mate');      // lets views use layout('...')

const pageRoutes = require('./routes/pages');

const app = express();

/* ----------  VIEW ENGINE  ---------- */
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ----------  STATIC ASSETS  ---------- */
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ----------  ROUTES  ---------- */
app.use('/', pageRoutes);                  // ➜ anything starting with / uses pages router

/* ----------  404 FALLBACK  ---------- */


/* ----------  START SERVER  ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log( `http://localhost:${PORT}`));
