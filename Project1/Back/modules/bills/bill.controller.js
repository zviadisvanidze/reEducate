const Bill = require('./bill.model');

const getBillsSummary = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.session.userId });

    const today = new Date().getDate();

    let paid = { count: 0, total: 0 };
    let upcoming = { count: 0, total: 0 };
    let dueSoon = { count: 0, total: 0 };

    bills.forEach((bill) => {
      if (bill.isPaid) {
        paid.count++;
        paid.total += bill.amount;
      } else if (bill.dueDay <= today + 7 && bill.dueDay >= today) {
        dueSoon.count++;
        dueSoon.total += bill.amount;
      } else {
        upcoming.count++;
        upcoming.total += bill.amount;
      }
    });

    res.json({
      paid: { count: paid.count, total: Math.round(paid.total * 100) / 100 },
      upcoming: { count: upcoming.count, total: Math.round(upcoming.total * 100) / 100 },
      dueSoon: { count: dueSoon.count, total: Math.round(dueSoon.total * 100) / 100 },
      totalBills: Math.round(bills.reduce((sum, b) => sum + b.amount, 0) * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const getBills = async (req, res) => {
  try {
    const { search, sort = 'latest' } = req.query;

    const filter = { userId: req.session.userId };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { dueDay: -1 };
        break;
      case 'a-z':
        sortOption = { name: 1 };
        break;
      case 'z-a':
        sortOption = { name: -1 };
        break;
      case 'highest':
        sortOption = { amount: -1 };
        break;
      case 'lowest':
        sortOption = { amount: 1 };
        break;
      default:
        sortOption = { dueDay: 1 };
    }

    const bills = await Bill.find(filter).sort(sortOption);

    const today = new Date().getDate();

    const billsWithStatus = bills.map((bill) => {
      let status = 'upcoming';
      if (bill.isPaid) {
        status = 'paid';
      } else if (bill.dueDay <= today + 7 && bill.dueDay >= today) {
        status = 'dueSoon';
      }

      return {
        _id: bill._id,
        name: bill.name,
        amount: bill.amount,
        dueDay: bill.dueDay,
        avatar: bill.avatar,
        color: bill.color,
        isPaid: bill.isPaid,
        status
      };
    });

    res.json(billsWithStatus);
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

module.exports = { getBills, getBillsSummary };
