const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { register, login, getUsers } = require('./controllers/user');
const mapUser = require('./helpers/mapUser');
const authenticated = require('./middlewares/authenticated');
const hasRole = require('./middlewares/hasRole');
const ROLES = require('./constants/roles');
const cors = require('cors');

const port = 3001;
const app = express();

// чтобы куки летали в обе стороны
const corsOptions = {
	origin: 'http://localhost:3001',
	credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.post('/register', async (req, res) => {
	try {
		const { token, user } = await register(req.body.login, req.body.password);

		res.cookie('token', token, { httpOnly: true }).send({
			error: null,
			user: mapUser(user),
		});
	} catch (error) {
		if (error.code === 11000) {
			res.send({ error: 'Such a user already exists!', user: null });
		}

		res.send({ error: error.message || 'Unknown error!', user: null });
	}
});

app.post('/login', async (req, res) => {
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

app.post('/logout', async (req, res) => {
	try {
		res.cookie('token', '', { httpOnly: true }).send({});
		SS;
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!', user: null });
	}
});

// подключаем middleware authenticated далее можем дать доступ к редактированию пользователей, так как только аутентифицированный пользователь и пользователь с ролью админ могут иметь доступ к этим контроллерам
app.use(authenticated);

app.get('/users', hasRole([ROLES.ADMIN]), async (req, res) => {
	const users = await getUsers();

	res.send({ data: users.map(mapUser) });
});

mongoose
	.connect(
		'mongodb+srv://alexis871:Valentina2006$@cluster.7kdmzin.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster',
	)
	.then(() => app.listen(port, () => console.log(`Server started on port ${port}...`)));
