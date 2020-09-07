const handleSignin = (req, res, bcrypt, db) => {
	const {email, password} = req.body;

	// security
	if (!email || !password) {
		return res.status(400).json("incorrect form submission");
	}

	db.select("email", "hash").from("login")
	.where("email", "=", email)
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if (isValid) {
			db.select("*").from("users")
			.where("email", "=", email)
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
}

module.exports = {
    handleSignin: handleSignin
};