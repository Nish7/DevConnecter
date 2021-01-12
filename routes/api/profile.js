const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const axios = require('axios');
const config = require('config');

// @route GET api/profile/me
// @desc  Get current users profle
// @access Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server Error');
	}
});

// @route POST api/profile
// @desc  Get Create or Update User profile
// @access Private
router.post(
	'/',
	[
		auth,
		[
			body('status', 'status is required').not().isEmpty(),
			body('skills', 'skills is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		let { skills, youtube, linkedin, instagram, twitter, facebook } = req.body;

		req.body.skills = skills.split(',').map((skill) => skill.trim());

		// Build Social Array
		const social = {
			youtube,
			linkedin,
			facebook,
			instagram,
			twitter,
		};

		req.body.social = social;
		req.body.user = req.user.id;

		try {
			let profile = await Profile.findOne({ user: req.body.user });

			// Update
			if (profile) {
				// Update
				profile = await Profile.findOneAndUpdate(
					{ user: req.body.user },
					req.body,
					{ new: true },
				);

				return res.json(profile);
			}

			// Create
			profile = new Profile(req.body);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	},
);

// @route GET api/profile
// @desc  Get Get all profiles
// @access Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route GET api/profile/user/:user_id
// @desc  Get Profile by UserId
// @access Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);

		if (err.kind == 'ObjectID') {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		return res.status(500).send('Server Error');
	}
});

// @route DELETE api/profile
// @desc  Get Get all profile,user and posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try {
		// Remove Users Posts
		await Post.deleteMany({ user: req.user.id });

		// Remove Profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove User
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User Removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route PUT api/profile/experience
// @desc  Add profile Experience
// @access Private

router.put(
	'/experience',
	[
		auth,
		[
			body('title', 'Title is required').not().isEmpty(),
			body('company', 'company is required').not().isEmpty(),
			body('from', 'From Date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(req.body);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	},
);

// @route DELETE api/profile/experience/:exp_id
// @desc  Remove profile Experience
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const foundProfile = await Profile.findOne({ user: req.user.id });

		foundProfile.experience = foundProfile.experience.filter(
			(exp) => exp._id.toString() !== req.params.exp_id,
		);

		await foundProfile.save();
		return res.status(200).json(foundProfile);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// @route PUT api/profile/experience
// @desc  Add profile Experience
// @access Private
router.put(
	'/education',
	[
		auth,
		[
			body('school', 'school is required').not().isEmpty(),
			body('degree', 'degree is required').not().isEmpty(),
			body('from', 'From Date is required').not().isEmpty(),
			body('fieldofstudy', 'field of study is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(req.body);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	},
);

// @route DELETE api/profile/experience/:exp_id
// @desc  Remove profile Experience
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Remove
		profile.education = profile.education.filter(
			(edu) => edu._id.toString() !== req.params.edu_id,
		);

		await profile.save();
		return res.status(200).json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server Error');
	}
});

// @route GET api/profile/github/:username
// @desc  GET User Github profiles
// @access Public
router.get('/github/:username', async (req, res) => {
	try {
		const uri = encodeURI(
			`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`,
		);
		const headers = {
			'user-agent': 'node.js',
			Authorization: `token ${config.get('githubtoken')}`,
		};

		const githubresp = await axios.get(uri, { headers });
		return res.json(githubresp.data);
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
