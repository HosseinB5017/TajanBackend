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
const Invatiation = require("../Route/Invitation.Route");
const Shops = require("../Route/Shop.Route");
const ServiceOrders = require("../Route/ServiceOrder.Route");
const Notifications = require("../Route/Notification.Route");
const Transactions = require("../Route/Transaction.Route");
const Cooperation = require("../Route/Cooperation.Route");
const ProductCategory = require("../Route/ProductCategory.Route");

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
app.use("/orders", Order);
app.use("/withdrawal" , Withdrawal);
app.use('/invatation' , Invatiation);
app.use("/shops", Shops);
app.use("/service-orders", ServiceOrders);
app.use("/notifications", Notifications);
app.use("/transactions", Transactions);
app.use("/cooperation", Cooperation);
app.use("/ProductCategory", ProductCategory);
app.use("/product-categories", ProductCategory);

module.exports = app;





