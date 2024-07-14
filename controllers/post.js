const Post = require('../models/Post');

// add
function addPost(post) {
	return Post.create(post);
}

// update
async function editPost(id, post) {
	return await Post.findByIdAndUpdate({ _id: id }, post, { returnDocument: 'after' });
}

// delete
function deletePost(id) {
	return Post.findByIdAndDelete({ _id: id });
}

// get list with search and pagination
async function getPosts(search = '', limit = 10, page = 1) {
	const [posts, count] = await Promise.all([
		Post.find({
			title: { $regex: search, $options: 'i' },
		})
			.limit(limit)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 }),
		Post.countDocuments({
			title: { $regex: search, $options: 'i' },
		}),
	]);

	console.log(posts, 'posts');

	return {
		posts,
		lastPage: Math.ceil(count / limit),
	};
}

// get item
function getPost(id) {
	return Post.findById({ _id: id });
}

module.exports = {
	addPost,
	editPost,
	deletePost,
	getPosts,
	getPost,
};
