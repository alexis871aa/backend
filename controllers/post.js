const Post = require('../models/Post');

// add
async function addPost(post) {
	const newPost = await Post.create(post);

	newPost.populate({
		path: 'comments',
		populate: 'author',
	});

	return newPost;
}

// update
async function editPost(id, post) {
	const editedPost = await Post.findByIdAndUpdate({ _id: id }, post, {
		returnDocument: 'after',
	});

	await editedPost.populate({
		path: 'comments',
		populate: 'author',
	});

	return editedPost;
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

	return {
		posts,
		lastPage: Math.ceil(count / limit),
	};
}

// get item
function getPost(id) {
	return Post.findById({ _id: id }).populate({
		path: 'comments',
		populate: 'author',
	});
}

module.exports = {
	addPost,
	editPost,
	deletePost,
	getPosts,
	getPost,
};
