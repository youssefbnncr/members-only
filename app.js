// Express
const path = require("node:path");
const express = require("express");
// Passport
const passport = require("passport");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const initializePassport = require("./config/passportConfig");
// Flash
const flash = require("connect-flash");
// DB
const pool = require("./model/pool");
require("dotenv").config();
// Routers
const userRouter = require("./routes/userRouter");
const indexRouter = require("./routes/indexRouter");
const boardsRouter = require("./routes/boardsRouter");
// App starts
const app = express();

initializePassport(passport);
app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    rolling: true,
    secret: `${process.env.session_password}`,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.session());
app.use(flash());

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: false }));

const assetsPath = path.join(__dirname, "src/css");
app.use(express.static(assetsPath));

app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads/avatars")),
);

app.use((req, res, next) => {
  res.locals.error_messages = req.flash("error");
  next();
});

app.use((req, res, next) => {
  res.locals.isLoged = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});
app.use("/user/", userRouter);
app.use("/board/", boardsRouter);
app.use("/", indexRouter);

app.use((req, res) => res.render("not_found"));

app.listen(3000, () =>
  console.log(`Server is running at: http://localhost:3000`),
);
