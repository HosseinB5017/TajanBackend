const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const dotenv = require("dotenv");
const  baseMiddleWare =  require ('./Route/BaseMiddleware');
const  fileDownloader =  require ('./Route/FileManager.Route');

dotenv.config();
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("db connected"))
    .catch((err) => {
        console.log("error connecting db >>", err)
    })

//https://sarakhs-panel.k4m.me/auth/login

// Configure CORS with specific allowed origins and headers
app.use(cors({
    origin: '*',
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials (if needed)
    allowedHeaders: '*' // Allow Authorization and token headers
}));


app.use(express.json());


app.use('/api' , baseMiddleWare);
app.use('/api/FileManager' ,fileDownloader );

// Static serve download directories
const path = require('path');
app.use('/download', express.static(path.join(__dirname, 'Download')));
app.use('/download', express.static(path.join(__dirname, 'download')));

// Legacy file download route (by filename)
app.get(['/download/Files/:filename', '/download/files/:filename'], function(req, res){
    var filePath = path.join(__dirname, process.env.filePath || 'download/files/', req.params.filename);
    res.download(filePath, function(err) {
        if (err) {
            if (!res.headersSent) {
                res.status(404).json({ error: "File not found" });
            }
        }
    });
});



var PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`App server is running on Port ${PORT}`)
});

app.get("/", (req, res) => {
    res.send("Application running -- Pasmand api ");
})


