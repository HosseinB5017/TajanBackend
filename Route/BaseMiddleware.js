const express = require('express');

const app = express.Router();
const userRoutes = require("../Route/Users.Route");
const News = require("../Route/News.Route");
const Banners = require("../Route/Banners.Route");
const wastes = require("../Route/Wastes.Route");
const Tickets = require("../Route/Tickets.Route.js");


app.use("/users", userRoutes);
app.use("/Banners", Banners);
app.use("/News" , News);
app.use("/Waste" , wastes);
app.use("/Tickets" , Tickets);



module.exports = app;





