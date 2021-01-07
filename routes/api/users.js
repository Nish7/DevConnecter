const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// @route POST api/users
// @desc  Register User
// @access Public
router.post(
	'/',
	[
		body('name', 'Name is Requierd').not().isEmpty(),
		body('email', 'please include a valid email').isEmail(),
		body(
			'password',
			'please enter a password with 6 or more character',
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if User exists
			let user = await User.findOne({ email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User Already Exist' }] });
			}

			// Get User Gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});

			user = new User({
				name,
				email,
				password,
				avatar,
			});

			// Encrypt password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			// Return JSONwebToken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;

					return res.status(200).json({ token });
				},
			);
		} catch (err) {
			console.error(err);
			res.status(500).send('Server Error');
		}
	},
);

module.exports = router;
