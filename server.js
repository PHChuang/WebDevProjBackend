const express = require("express");
const app = express();
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

// initialize the library
const db = knex({
	client: 'pg',
	connection: {
		host : '127.0.0.1', // localhost
		user : 'Kevin',
		password : '',
		database : 'smart-brain'
	}
});

// parse json
app.use(express.json());

// use cors
app.use(cors());

// app.get("/", (req, res) => {
// 	res.send("server is working");
// 	// res.send(database.users);
// });

// sign in (version 2: using knex)
app.post("/signin", (req, res) => {signin.handleSignin(req, res, bcrypt, db);});

// register (version 3: adopting transaction)
app.post("/register", (req, res) => {register.handleRegister(req, res, bcrypt, db);});

// find profile (version 2: using knex)
app.get("/profile/:id", (req, res) => {profile.handleProfileGet(req, res, db );});

// image page (version 2: using knex)
app.put("/image", (req, res) => {image.handleImage(req, res, db);});

app.listen(3000, () => {
	console.log("app is running on port 3000");
});