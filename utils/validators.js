const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Wrong email format')
    .custom(async (value, { req }) => {
      try {
        const canditate = await User.findOne({ email: req.body.email });
        if (canditate) {
          return Promise.reject('User with this email already exists');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }),
  body('password', 'Password must be at least 6 characters and contains numbers and letter')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password do not match');
      }
      return true;
    })
    .trim(),

  body('name', 'Name must contain at least 3 characters').isLength({ min: 3, max: 15 }).trim(),
];
