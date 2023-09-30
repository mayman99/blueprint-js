require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const ejs = require("ejs")
const cors = require("cors");
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;

const UserModel = require('./data/UserModel');

/* Setup application */
const app = express();
app.use(express.json());
app.use(cors());

/* Setup view engine EJS, body-parser and express-static */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

/* Setup session */
app.use(
    session({
        secret: 'secretly',
        resave: false,
        saveUninitialized: false,
    })
);

/* Start the Server */
const server = http.createServer(app, (req,res) => {
    res.end("SSL ADDED");
})
.listen(process.env.PORT, () => console.log("Server is Running"));

mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log("database connected");
    })
    .catch((err) => console.log(err));

/* Render LandingPage */
app.get("/", (req, res) => {
    res.render("landingPage")
})

/* Render Registration View */
app.get("/registration", (req, res) => {
    res.render("registration")
})

/* Render Dashboard View */
app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

/* Render Profile View */
app.get("/profile", (req, res) => {
    res.render("profile")
})


/* Post User to MongoDB Collection */
app.post("/createUser", (req, res) => {
    const user = req.body;
    const db =  mongoose.connection;
    
    const userObject = new UserModel({
        email: user.email,
        projects: user.projects,
        username: user.username,
        profileimage: user.profileimage
    })

    // create collection for user using his uid from FB
    db.collection(user.uid)
        .insertOne(userObject)
        .then((result) => {
            res.status(201).json(result);
        })
        .catch((err) => {
            res.status(500).json({err: "Could not create a new document"});
        })

})


