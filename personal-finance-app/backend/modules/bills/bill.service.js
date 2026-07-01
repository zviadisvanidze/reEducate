const Bill = require("./bill.model");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const isDueSoon = (dueDay, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDayThisMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  let dueDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(dueDay, lastDayThisMonth),
  );

  if (dueDate < today) {
    const lastDayNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      0,
    ).getDate();
    dueDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      Math.min(dueDay, lastDayNextMonth),
    );
  }

  const daysAway = Math.round((dueDate - today) / 86400000);
  return daysAway >= 0 && daysAway <= 7;
};

exports.isDueSoon = isDueSoon;

exports.getBillsSummary = async (userId) => {
  const bills = await Bill.find({ userId });

  const summary = bills.reduce(
    (acc, bill) => {
      if (bill.isPaid) {
        acc.paid.count++;
        acc.paid.total += bill.amount;
      } else if (isDueSoon(bill.dueDay)) {
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
    filter.name = {
      $regex: `^${escapeRegex(search.trim())}`,
      $options: "i",
    };
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

  return bills.map((bill) => {
    let status = "upcoming";
    if (bill.isPaid) {
      status = "paid";
    } else if (isDueSoon(bill.dueDay)) {
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

exports.createBill = ({ userId, name, amount, dueDay, color, isPaid }) => {
  return Bill.create({
    userId,
    name,
    amount,
    dueDay,
    avatar: initials(name),
    color,
    isPaid,
  });
};

exports.updateBill = ({ userId, id, name, amount, dueDay, color, isPaid }) => {
  return Bill.findOneAndUpdate(
    { _id: id, userId },
    {
      name,
      amount,
      dueDay,
      avatar: initials(name),
      color,
      isPaid,
    },
    { new: true, runValidators: true },
  );
};

exports.updateBillStatus = ({ userId, id, isPaid }) => {
  return Bill.findOneAndUpdate(
    { _id: id, userId },
    { isPaid },
    { new: true, runValidators: true },
  );
};

exports.deleteBill = ({ userId, id }) => {
  return Bill.findOneAndDelete({ _id: id, userId });
};
