const express = require('express');
const { register, login } = require('../controllers/user');
const mapUser = require('../helpers/mapUser');

const router = express.Router({ mergeParams: true });

router.post('/register', async (req, res) => {
	try {
		const { token, user } = await register(req.body.login, req.body.password);

		res.cookie('token', token, { httpOnly: true }).send({
			error: null,
			user: mapUser(user),
		});
	} catch (error) {
		if (error.code === 11000) {
			res.send({ error: 'Such a user already exists!' });
			return;
		}

		res.send({ error: error.message || 'Unknown error!' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { user, token } = await login(req.body.login, req.body.password);

		res.cookie('token', token, { httpOnly: true }).send({
			error: null,
			user: mapUser(user),
		});
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!', user: null });
	}
});

router.post('/logout', (req, res) => {
	try {
		res.cookie('token', '', { httpOnly: true }).send({});
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!', user: null });
	}
});

module.exports = router;
