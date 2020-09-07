const handleRegister = (req, res, bcrypt, db) => {
	const {name, email, password} = req.body;
	const hash = bcrypt.hashSync(password);

	// security
	if (!name || !email || !password) {
		return res.status(400).json("incorrect form submission");
	}

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
        console.log(err);
		res.status(400).json("unable to register!");
	});
}

module.exports = {
    handleRegister: handleRegister
};