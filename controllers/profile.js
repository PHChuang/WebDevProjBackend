const handleProfileGet = (req, res, db) => {
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
}

module.exports = {
    handleProfileGet: handleProfileGet
};