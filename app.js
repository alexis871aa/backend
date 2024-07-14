const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {
	register,
	login,
	getUsers,
	getRoles,
	updateUser,
	deleteUser,
} = require('./controllers/user');
const {
	addPost,
	editPost,
	deletePost,
	getPosts,
	getPost,
} = require('./controllers/post');
const mapUser = require('./helpers/mapUser');
const mapPost = require('./helpers/mapPost');
const authenticated = require('./middlewares/authenticated');
const hasRole = require('./middlewares/hasRole');
const ROLES = require('./constants/roles');
// const cors = require('cors');

const port = 3001;
const app = express();

// чтобы куки летали в обе стороны
// const corsOptions = {
// 	origin: 'http://localhost:3001',
// 	credentials: true,
// };
// app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// обработка запросов для регистрации, авторизации и выхода
app.post('/register', async (req, res) => {
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

app.post('/logout', (req, res) => {
	try {
		res.cookie('token', '', { httpOnly: true }).send({});
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!', user: null });
	}
});

// обработка запросов для постов
app.get('/posts', async (req, res) => {
	const { posts, lastPage } = await getPosts(
		req.query.search,
		req.query.limit,
		req.query.page,
	);

	res.send({ data: { posts: posts.map(mapPost), lastPage } });
});

app.get('/posts/:id', async (req, res) => {
	const post = await getPost(req.params.id);

	res.send({ data: mapPost(post) });
});

// подключаем middleware authenticated далее можем дать доступ к редактированию пользователей, так как только аутентифицированный пользователь и пользователь с ролью админ могут иметь доступ к этим контроллерам
app.use(authenticated);

// обработка запросов для пользователей и ролей (только для администратора)
app.get('/users', hasRole([ROLES.ADMIN]), async (req, res) => {
	const users = await getUsers();

	res.send({ data: users.map(mapUser) });
});

app.get('/users/roles', hasRole([ROLES.ADMIN]), (req, res) => {
	const roles = getRoles();

	res.send({ data: roles });
});

app.patch('/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
	try {
		const newUser = await updateUser(req.params.id, {
			role: req.body.roleId,
		});

		res.send({ data: mapUser(newUser) });
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!' });
	}
});

app.delete('/users/:id', hasRole([ROLES.ADMIN]), (req, res) => {
	try {
		deleteUser(req.params.id);

		res.send({ error: null });
	} catch (error) {
		res.send({ error: error.message || 'Unknown error!' });
	}
});

// обработка запросов для добавления, редактирования и удаления поста, здесь необходимо контролировать роли
app.post('/posts', hasRole([ROLES.ADMIN]), async (req, res) => {
	const newPost = await addPost({
		title: req.body.title,
		content: req.body.content,
		image: req.body.imageUrl,
	});

	res.send({ data: newPost });
});

app.patch('/posts/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
	const updatedPost = await editPost(req.params.id, {
		title: req.body.title,
		content: req.body.content,
		image: req.body.imageUrl,
	});

	res.send({ data: mapPost(updatedPost) });
});

app.delete('/posts/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
	await deletePost(req.params.id);

	res.send({ error: null });
});

mongoose
	.connect(
		'mongodb+srv://alexis871:Valentina2006$@cluster.7kdmzin.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster',
	)
	.then(() => app.listen(port, () => console.log(`Server started on port ${port}...`)));
