const express = require('express');

const app = express.Router();
const userRoutes = require("../Route/Users.Route");
const News = require("../Route/News.Route");
const Banners = require("../Route/Banners.Route");
const wastes = require("../Route/Wastes.Route");
const wastesCategory = require("../Route/WastesCategory.Route");
const Tickets = require("../Route/Tickets.Route.js");
const UserAddress = require("../Route/UserAddress.Route.js");
const city = require("../Route/City");
const TimeSlots = require("../Route/TimeSlots.Route");
const state = require("../Route/State");
const Order = require("../Route/Order.Route.js");
const Withdrawal = require("../Route/Withdrawal.Route");




app.use("/users", userRoutes);
app.use("/Banners", Banners);
app.use("/News" , News);
app.use("/Waste" , wastes);
app.use("/WasteCategory" , wastesCategory);
app.use("/Tickets" , Tickets);
app.use("/city" , city);
app.use("/state" , state);
app.use("/UserAddress" , UserAddress);
app.use("/TimeSlots" , TimeSlots);
app.use("/Order" , Order);
app.use("/withdrawal" , Withdrawal);


module.exports = app;





