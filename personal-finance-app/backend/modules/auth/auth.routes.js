const express = require("express");
const authRouter = express.Router();
const { signup, login, logout, currentUser } = require("./auth.controller");
const validate = require("../middlewares/validate");
const { signUpDto } = require("./dto/sign-up.dto");
const { signInDto } = require("./dto/sign-in.dto");
const isAuthMiddleware = require("../middlewares/is-auth.middleware");

authRouter.post("/signup", validate(signUpDto), signup);
authRouter.post("/login", validate(signInDto), login);
authRouter.post("/logout", logout);
authRouter.get("/current-user", isAuthMiddleware, currentUser);

module.exports = authRouter;
