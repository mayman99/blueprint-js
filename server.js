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

/* Render LandingPage */
app.get("/", (req, res) => {
    res.render("landingPage")
})

app.get("/registration", (req, res) => {
    res.render("registration")
})


