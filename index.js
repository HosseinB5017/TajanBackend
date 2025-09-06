const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./Route/Users.Route");
const News = require("./Route/News.Route");
const Projects = require("./Route/Projects.Route");
const Events = require("./Route/Events.Route");
const Banners = require("./Route/Banners.Route");
const cityMedia = require("./Route/CityMedia.Route");
const services = require("./Route/Services.Route");
const mayor = require("./Route/MayorInfo.Route");
const sarakhsInfo = require("./Route/SarakhsInfo.Route");
const Tickets = require("./Route/Tickets.Route.js");


dotenv.config();
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("db connected"))
    .catch((err) => {
        console.log("error connecting db >>", err)
    })

//https://sarakhs-panel.k4m.me/auth/login
const allowedDomains = [ 'http://localhost:3000' , 'https://sarakhs.k4m.me' , 'http://localhost:3001','https://sarakhs.ir' , 'https://sarakhs-panel.k4m.me'];

// Configure CORS with specific allowed origins and headers
app.use(cors({
    origin: '*',
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials (if needed)
    allowedHeaders: '*' // Allow Authorization and token headers
}));


app.use(express.json());
app.get("/", (req, res) => {
    res.send("Application running")
})

app.use("/api/users", userRoutes);
app.use("/api/Banners", Banners);
app.use("/api/News" , News);
app.use("/api/Events" , Events);
app.use("/api/Projects" , Projects);
app.use("/api/Videos" , cityMedia);
app.use("/api/Services" , services);
app.use("/api/MayorInfo" , mayor);
app.use("/api/SarakhsInfo" , sarakhsInfo);
app.use("/api/Tickets" , Tickets);



app.get('/download/user/:filename', function(req, res){
    var file = process.env.UserImagePath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Banners/:filename', function(req, res){
    var file = process.env.BannersPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Projects/:filename', function(req, res){
    var file = process.env.ProjectsPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Events/:filename', function(req, res){
    var file = process.env.EventsPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/News/:filename', function(req, res){
    var file = process.env.NewsPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Media/:filename', function(req, res){
    var file = process.env.CityMediaPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Service/:filename', function(req, res){
    var file = process.env.ServicePath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Mayor/:filename', function(req, res){
    var file = process.env.mayorPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});

app.get('/download/Mayor/:filename', function(req, res){
    var file = process.env.mayorPath + req.params.filename;
    res.download(file); // Set disposition and send it.
});


app.get('/download/Tickets/:filename', function(req, res){
    var file = process.env.ticketFiles + req.params.filename;
    res.download(file); // Set disposition and send it.
});


var PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`App server is running on Port ${PORT}`)
});
