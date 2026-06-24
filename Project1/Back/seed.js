require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
const User = require('./modules/auth/auth.model');
const Transaction = require('./modules/transactions/transaction.model');
const Budget = require('./modules/budgets/budget.model');
const Pot = require('./modules/pots/pot.model');
const Bill = require('./modules/bills/bill.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB დაკავშირებულია');

  // ძველი მონაცემების წაშლა
  await mongoose.connection.collection('counters').deleteMany({}).catch(() => {});
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});
  await Pot.deleteMany({});
  await Bill.deleteMany({});
  console.log('ძველი მონაცემები წაშლილია');

  // მომხმარებელი
  const user = await User.create({
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    balance: 4836.00
  });
  console.log('მომხმარებელი შექმნილია: test@test.com / password123');

  const userId = user.userId;

  // ტრანზაქციები
  await Transaction.insertMany([
    { userId, name: 'Emma Richardson', category: 'General', date: new Date('2024-08-19'), amount: 75.50, avatar: 'ER', color: '--green' },
    { userId, name: 'Savory Bites Bistro', category: 'Dining Out', date: new Date('2024-08-19'), amount: -55.50, avatar: 'SB', color: '--brown' },
    { userId, name: 'Daniel Carter', category: 'General', date: new Date('2024-08-18'), amount: -42.30, avatar: 'DC', color: '--blue' },
    { userId, name: 'Sun Park', category: 'General', date: new Date('2024-08-17'), amount: 120.00, avatar: 'SP', color: '--magenta' },
    { userId, name: 'Urban Services Hub', category: 'General', date: new Date('2024-08-17'), amount: -65.00, avatar: 'US', color: '--gold' },
    { userId, name: 'Liam Hughes', category: 'Groceries', date: new Date('2024-08-15'), amount: 65.75, avatar: 'LH', color: '--turquoise' },
    { userId, name: 'Lily Ramirez', category: 'General', date: new Date('2024-08-14'), amount: 50.00, avatar: 'LR', color: '--purple' },
    { userId, name: 'Ethan Clark', category: 'Dining Out', date: new Date('2024-08-13'), amount: -32.50, avatar: 'EC', color: '--army' },
    { userId, name: 'James Thompson', category: 'Entertainment', date: new Date('2024-08-11'), amount: -5.00, avatar: 'JT', color: '--orange' },
    { userId, name: 'Pixel Playground', category: 'Entertainment', date: new Date('2024-08-11'), amount: -10.00, avatar: 'PP', color: '--purple' },
    { userId, name: 'Rina Sato', category: 'Entertainment', date: new Date('2024-07-13'), amount: -10.00, avatar: 'RS', color: '--magenta' },
    { userId, name: 'Spark Electric Solutions', category: 'Bills', date: new Date('2024-08-02'), amount: -100.00, avatar: 'SE', color: '--red' },
    { userId, name: 'Rina Sato', category: 'Bills', date: new Date('2024-08-02'), amount: -50.00, avatar: 'RS', color: '--magenta' },
    { userId, name: 'Aqua Flow Utilities', category: 'Bills', date: new Date('2024-07-30'), amount: -100.00, avatar: 'AF', color: '--navy' },
    { userId, name: 'Ella Phillips', category: 'Dining Out', date: new Date('2024-08-10'), amount: -45.00, avatar: 'EP', color: '--magenta' },
    { userId, name: 'William Harris', category: 'Personal Care', date: new Date('2024-08-05'), amount: -10.00, avatar: 'WH', color: '--blue' },
    { userId, name: 'Serenity Spa & Wellness', category: 'Personal Care', date: new Date('2024-08-03'), amount: -30.00, avatar: 'SS', color: '--yellow' },
    { userId, name: 'Serenity Spa & Wellness', category: 'Personal Care', date: new Date('2024-07-03'), amount: -30.00, avatar: 'SS', color: '--yellow' }
  ]);
  console.log('ტრანზაქციები ჩაწერილია');

  // ბიუჯეტები
  await Budget.insertMany([
    { userId, category: 'Entertainment', maximum: 50.00, theme: 'green' },
    { userId, category: 'Bills', maximum: 750.00, theme: 'cyan' },
    { userId, category: 'Dining Out', maximum: 75.00, theme: 'yellow' },
    { userId, category: 'Personal Care', maximum: 100.00, theme: 'navy' }
  ]);
  console.log('ბიუჯეტები ჩაწერილია');

  // ქოთნები
  await Pot.insertMany([
    { userId, name: 'Savings', target: 2000, saved: 159, theme: 'green' },
    { userId, name: 'Concert Ticket', target: 150, saved: 110, theme: 'navy' },
    { userId, name: 'Gift', target: 60, saved: 40, theme: 'cyan' },
    { userId, name: 'New Laptop', target: 1000, saved: 10, theme: 'yellow' },
    { userId, name: 'Holiday', target: 1440, saved: 531, theme: 'purple' }
  ]);
  console.log('ქოთნები ჩაწერილია');

  // გადასახადები
  await Bill.insertMany([
    { userId, name: 'Spark Electric Solutions', amount: 100.00, dueDay: 2, avatar: 'SE', color: '--red', isPaid: true },
    { userId, name: 'Serenity Spa & Wellness', amount: 30.00, dueDay: 3, avatar: 'SS', color: '--yellow', isPaid: true },
    { userId, name: 'Elevate Education', amount: 50.00, dueDay: 4, avatar: 'EE', color: '--green', isPaid: true },
    { userId, name: 'Pixel Playground', amount: 10.00, dueDay: 11, avatar: 'PP', color: '--purple', isPaid: true },
    { userId, name: 'Nimbus Data Storage', amount: 9.99, dueDay: 21, avatar: 'ND', color: '--orange', isPaid: false },
    { userId, name: 'ByteWise', amount: 49.99, dueDay: 23, avatar: 'BW', color: '--purple', isPaid: false },
    { userId, name: 'EcoFuel Energy', amount: 35.00, dueDay: 29, avatar: 'EF', color: '--turquoise', isPaid: false },
    { userId, name: 'Aqua Flow Utilities', amount: 100.00, dueDay: 30, avatar: 'AF', color: '--navy', isPaid: false }
  ]);
  console.log('გადასახადები ჩაწერილია');

  console.log('\nSeed დასრულებულია!');
  console.log('ავტორიზაცია: email=test@test.com, password=password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed შეცდომა:', err);
  process.exit(1);
});
