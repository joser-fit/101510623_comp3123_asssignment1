const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .isString()
      .withMessage('Username must be text')
      .bail()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must contain 3–50 characters'),

    body('email')
      .isString()
      .withMessage('Email must be text')
      .bail()
      .trim()
      .isEmail()
      .withMessage('Enter a valid email address')
      .bail()
      .toLowerCase(),

    body('password')
      .isString()
      .withMessage('Password must be text')
      .bail()
      .isLength({ min: 8 })
      .withMessage('Password must contain at least 8 characters')
      .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
      .withMessage('Password must not exceed 72 bytes')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    try {
      const { username, email, password } = req.body;

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        username,
        email,
        password: passwordHash
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Username or email already exists'
        });
      }

      console.error('Registration failed:', error.message);

      return res.status(500).json({
        message: 'Unable to register user'
      });
    }
  }
);

router.post(
  '/login',
  [
    body('email')
      .isString()
      .bail()
      .trim()
      .isEmail()
      .withMessage('Enter a valid email address')
      .bail()
      .toLowerCase(),

    body('password')
      .isString()
      .bail()
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login failed:', error.message);

      return res.status(500).json({
        message: 'Unable to log in'
      });
    }
  }
);
module.exports = router;