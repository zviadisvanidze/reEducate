const User = require('./auth.model');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'ყველა ველი სავალდებულოა' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'ეს ელფოსტა უკვე რეგისტრირებულია' });
    }

    const user = await User.create({ name, email, password });

    req.session.userId = user.userId;

    res.status(201).json({
      message: 'რეგისტრაცია წარმატებულია',
      user: { id: user.userId, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'ელფოსტა და პაროლი სავალდებულოა' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'არასწორი ელფოსტა ან პაროლი' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'არასწორი ელფოსტა ან პაროლი' });
    }

    req.session.userId = user.userId;

    res.json({
      message: 'ავტორიზაცია წარმატებულია',
      user: { id: user.userId, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'გამოსვლის შეცდომა' });
    }
    res.json({ message: 'წარმატებით გამოხვედით' });
  });
};

module.exports = { signup, login, logout };
