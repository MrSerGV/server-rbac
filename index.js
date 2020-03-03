const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const User = require('./models/user-model');
const routes = require('./routes/router.js');

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        try {
            const accessToken = req.headers["x-access-token"];
            const { id, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
            // If token has expired
            if (exp < Date.now().valueOf() / 1000) {
                return res.status(401).json({
                    error: "JWT token has expired, please login to obtain a new one"
                });
            };
            res.locals.loggedInUser = await User.findOne({
                where: {
                    id
                },
                  raw: true
            }); 
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    };
});

app.use('/', routes);

app.listen(PORT, () => {
  console.log('Server started on port: ', PORT);
});