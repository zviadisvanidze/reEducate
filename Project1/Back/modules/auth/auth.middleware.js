const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'გაიარეთ ავტორიზაცია' });
  }
  next();
};

module.exports = requireAuth;
