const express = require("express");
const app = express();

const bcrypt = require("bcrypt-nodejs");
const cors = require('cors');

const knex = require("knex");
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

// // check whether db exists
// db.select("*").from("users").then(data => {
// 	console.log(data);
// });

// parse json
app.use(express.json());

// use cors
app.use(cors());

// build a database
const database = {
	users: [
		{
			id: "123",
			name: "John",
			email: "John@gmail.com",
			password: "cookies",
			entries: 0,
			joined: new Date()
		},
		{
			id: "124",
			name: "Sally",
			email: "Sally@gmail.com",
			password: "bananas",
			entries: 0,
			joined: new Date()
		}
	]
};

app.get("/", (req, res) => {
	// res.send("server is working");
	res.send(database.users);
});

// // signin (version 1)
// app.post("/signin", (req, res) => {
// 	if (req.body.email === database.users[0].email &&
// 		req.body.password === database.users[0].password) {
// 		res.json("success");
// 	}
// 	else {
// 		res.status(400).json("error logging in");
// 	}
// })

// sign in (version 2: using knex)
app.post("/signin", (req, res) => {
	db.select("email", "hash").from("login")
	.where("email", "=", req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid) {
			db.select("*").from("users")
			.where("email", "=", req.body.email)
			.then(user => {
				res.json(user[0]);
			})
			.catch(err => {
				res.json("unable to get user");
			});
		}
		else {
			res.json("wrong credentials");
		}
	})
	.catch(err => {
		res.json("wrong credentials");
	});
})

// // register (version 1)
// app.post("/register", (req, res) => {
// 	const {name, email, password} = req.body;

// 	// test bcrypt
// 	let passwordHash;
// 	bcrypt.hash(password, null, null, function(err, hash) {
// 		passwordHash = hash;
// 		console.log(hash);
// 		console.log(passwordHash);
// 	});

// 	bcrypt.compare("bacon", passwordHash, function(err, res) {
// 		console.log(passwordHash);
// 		console.log("first guess: ", res);
// 	});

// 	bcrypt.compare(password, passwordHash, function(err, res) {
// 		console.log("second guess: ", res);
// 	});

// 	// code before learning how to create databse
// 	database.users.push({
// 		id: "125",
// 		name: name,
// 		email: email,
// 		password: password,
// 		entries: 0,
// 		joined: new Date()
// 	});

// 	res.json(database.users[database.users.length - 1]);
// });

// // register (version 2: using knex)
// app.post("/register", (req, res) => {
// 	const {name, email, password} = req.body;

// 	db("users")
// 	.returning("*") // return what was inserted. * stands for all column
// 	.insert({
// 		email: email,
// 		name: name,
// 		joined: new Date()
// 	})
// 	.then(response => {
// 		res.json(response);
// 	})
// 	.catch(err => {
// 		res.status(400).json("unable to register!");
// 	});
// });

// register (version 3: adopting transaction)
app.post("/register", (req, res) => {
	const {name, email, password} = req.body;
	const hash = bcrypt.hashSync(password);

	db.transaction(trx => { // use transaction when we want to do more than two things
		trx.insert({
			hash: hash,
			email: email
		})
		.into("login")
		.returning("email")
		.then(loginEmail => {
			return trx("users")
			.returning("*") // return what was inserted. * stands for all column
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(response => {
				res.json(response);
			})
		})
		.then(trx.commit) // if a promise is not return by handler function, it is up to you to ensure trx.commit, or trx.rollback are called, otherwise the transaction connection will hang.
		.catch(trx.rollback)
	})
	.catch(err => {
		res.status(400).json("unable to register!");
	});
});

// // find profile (version 1)
// app.get("/profile/:id", (req, res) => {
// 	const {id} = req.params;
// 	let found = false;

// 	database.users.forEach(user => {
// 		if (id === user.id) {
// 			found = true;
// 			return res.json(user);
// 		}
// 	});

// 	if (!found) {
// 		res.status(400).json("not found");
// 	}
// });

// find profile (version 2: using knex)
app.get("/profile/:id", (req, res) => {
	const {id} = req.params;
	// let found = false;

	db.select("*").from("users")
	.where({
		"id": id
	})
	.then(users => {
		if (users.length) {
			res.json(users[0]);
		}
		else {
			res.status(400).json("Not found");
		}
	})
	.catch(err => {
		res.status(400).json("error getting user");
	});

	// if (!found) {
	// 	res.status(400).json("not found");
	// }
});

// // image page (version 1)
// app.put("/image", (req, res) => {
// 	const {id} = req.body;
// 	let found = false;

// 	database.users.forEach(user => {
// 		if (id === user.id) {
// 			found = true;
// 			++user.entries;
// 			return res.json(user.entries);
// 		}
// 	});

// 	if (!found) {
// 		res.status(400).json("not found");
// 	}
// });

// image page (version 2: using knex)
app.put("/image", (req, res) => {
	const {id} = req.body;
	
	db('users')
	.where('id', '=', id)
	.increment("entries", 1)
	.returning("entries")
	.then(entries => console.log(entries))
	.catch(err => res.status(400).json("unable to get image"));
});

// // bcrypt
// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => {
	console.log("app is running on port 3000");
});