const Bill = require("./bill.model");

exports.getBillsSummary = async (userId) => {
  const bills = await Bill.find({ userId });
  const today = new Date().getDate();

  const summary = bills.reduce(
    (acc, bill) => {
      if (bill.isPaid) {
        acc.paid.count++;
        acc.paid.total += bill.amount;
      } else if (bill.dueDay <= today + 7 && bill.dueDay >= today) {
        acc.dueSoon.count++;
        acc.dueSoon.total += bill.amount;
      } else {
        acc.upcoming.count++;
        acc.upcoming.total += bill.amount;
      }

      acc.totalBills += bill.amount;
      return acc;
    },
    {
      paid: { count: 0, total: 0 },
      upcoming: { count: 0, total: 0 },
      dueSoon: { count: 0, total: 0 },
      totalBills: 0,
    },
  );

  return {
    paid: { count: summary.paid.count, total: Math.round(summary.paid.total * 100) / 100 },
    upcoming: { count: summary.upcoming.count, total: Math.round(summary.upcoming.total * 100) / 100 },
    dueSoon: { count: summary.dueSoon.count, total: Math.round(summary.dueSoon.total * 100) / 100 },
    totalBills: Math.round(summary.totalBills * 100) / 100,
  };
};

exports.getBills = async ({ userId, search, sort = "latest" }) => {
  const filter = { userId };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  let sortOption = {};
  switch (sort) {
    case "oldest":
      sortOption = { dueDay: -1 };
      break;
    case "a-z":
      sortOption = { name: 1 };
      break;
    case "z-a":
      sortOption = { name: -1 };
      break;
    case "highest":
      sortOption = { amount: -1 };
      break;
    case "lowest":
      sortOption = { amount: 1 };
      break;
    default:
      sortOption = { dueDay: 1 };
  }

  const bills = await Bill.find(filter).sort(sortOption);
  const today = new Date().getDate();

  return bills.map((bill) => {
    let status = "upcoming";
    if (bill.isPaid) {
      status = "paid";
    } else if (bill.dueDay <= today + 7 && bill.dueDay >= today) {
      status = "dueSoon";
    }

    return {
      _id: bill._id,
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      avatar: bill.avatar,
      color: bill.color,
      isPaid: bill.isPaid,
      status,
    };
  });
};