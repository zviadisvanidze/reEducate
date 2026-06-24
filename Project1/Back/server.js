const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { default: MongoStore } = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Front')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/transactions', require('./modules/transactions/transaction.routes'));
app.use('/api/budgets', require('./modules/budgets/budget.routes'));
app.use('/api/pots', require('./modules/pots/pot.routes'));
app.use('/api/bills', require('./modules/bills/bill.routes'));
app.use('/api/overview', require('./modules/overview/overview.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`სერვერი გაშვებულია პორტზე ${PORT}`);
});
