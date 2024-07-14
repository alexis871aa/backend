const express = require('express');
const { getUsers, getRoles, updateUser, deleteUser } = require('../controllers/user');
const hasRole = require('../middlewares/hasRole');
const authenticated = require('../middlewares/authenticated');
const mapUser = require('../helpers/mapUser');
const ROLES = require('../constants/roles');

const router = express.Router({ mergeParams: true });

router.get('/', authenticated, hasRole([ROLES.ADMIN]), async (req, res) => {
	const users = await getUsers();

	res.send({ data: users.map(mapUser) });
});

router.get('/roles', authenticated, hasRole([ROLES.ADMIN]), (req, res) => {
	const roles = getRoles();

	res.send({ data: roles });
});

router.patch('/:id', authenticated, hasRole([ROLES.ADMIN]), async (req, res) => {
	try {
		const newUser = await updateUser(req.params.id, {
			role: req.body.roleId,
		});

		res.send({ data: mapUser(newUser) });
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!' });
	}
});

router.delete('/:id', authenticated, hasRole([ROLES.ADMIN]), (req, res) => {
	try {
		deleteUser(req.params.id);

		res.send({ error: null });
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!' });
	}
});

module.exports = router;
