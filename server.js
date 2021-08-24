const express = require("express");
const bodyParser = require("body-parser");
const task = require('./app/tasks/task.backgroud');
const cors = require('cors')
const constants = require('./app/config/constant');
var _log = constants._log;

const passport = require('passport');

require('./app/utils/passport.util')(passport);

const app = express();

app.use(passport.initialize());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.use(cors('*'))

const userRoutes = require('./app/routes/user.route');
const urlRoutes = require('./app/routes/url.route');
app.use('/', userRoutes);
app.use('/', urlRoutes);
//require("./app/routes/user.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 830;
app.listen(PORT, () => {
  _log && console.log(`Server is running on port ${PORT}.`,new Date());
});

task.start();