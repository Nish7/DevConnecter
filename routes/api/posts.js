const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route POST api/posts
// @desc  Create a Post
// @access Private
router.post(
	'/',
	[auth, [body('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			const post = await newPost.save();
			return res.json(post);
		} catch (err) {
			console.log(err);
			res.status(500).send('Server Error');
		}
	},
);

// @route GET api/posts
// @desc  Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});

// @route GET api/posts/:post_id
// @desc  Get a post by id
// @access Private
router.get('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not Found' });
		}

		res.json(post);
	} catch (err) {
		console.log(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not Found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route DELETE api/posts/:post_id
// @desc  remove a post by id
// @access Private
router.delete('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not Found' });
		}

		// Check User
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorised' });
		}

		await post.remove();
		res.json({ msg: 'Post Removed' });
	} catch (err) {
		console.log(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not Found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route PUT api/posts/like/:id
// @desc  like a post
// @access Private
router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check if user have already been liked
		if (post.likes.map((like) => like.user).includes(req.user.id)) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });
		await post.save();
		res.json(post.likes);
	} catch (err) {
		console.log(err);
		re.status(500).send('Server Error');
	}
});

// @route PUT api/posts/unlike/:id
// @desc  unlike a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check if user have already been liked
		if (!post.likes.map((like) => like.user).includes(req.user.id)) {
			return res.status(400).json({ msg: 'Post havent already liked' });
		}

		post.likes = post.likes.filter(
			(like) => like.user.toString() !== req.user.id,
		);

		await post.save();
		res.json(post.likes);
	} catch (err) {
		console.log(err);
		re.status(500).send('Server Error');
	}
});

// @route POST api/posts/comment/:id
// @desc  Add a comment on a post
// @access Private
router.post(
	'/comment/:id',
	[auth, [body('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();
			res.json(post.comments);
		} catch (err) {
			console.log(err);
			res.status(500).send('Server Error');
		}
	},
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc  Delete a comment
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		const comment = post.comments.find(
			(comment) => comment.id == req.params.comment_id,
		);

		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		post.comments = post.comments.filter(
			(comment) => comment.id !== req.params.comment_id,
		);

		await post.save();

		res.json(post.comments);
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
