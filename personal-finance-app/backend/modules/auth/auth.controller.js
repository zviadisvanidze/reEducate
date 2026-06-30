const User = require("./auth.model");
const authService = require("./auth.service");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const resp = await authService.signUp({ name, email, password });
    if (resp === "ALREADY_EXISTS") {
      return res
        .status(400)
        .json({ message: "This email is already registered" });
    }

    const accessToken = await authService.signIn({ email, password });

    res.status(201).json({
      message: "User signed up successfully",
      user: { name: resp.name, email: resp.email },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const resp = await authService.signIn({ email, password });
    if (resp === "INVALID_CREDENTIALS") {
      return res.status(400).json({ message: "Wrong email or password" });
    }

    res.json({
      message: "User logged in successfully",
      accessToken: resp,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  await authService.logout();

  res.json({ message: "User logged out successfully" });
};

const currentUser = async (req, res) => {
  const user = await authService.currentUser(req.userId);

  if (!user) {
    return res.status(404).json({ message: " user not found" });
  }

  res.json(user);
};

module.exports = { signup, login, logout, currentUser };
