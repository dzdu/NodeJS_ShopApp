const { body } = require('express-validator');

exports.registerValidators = [
  body('email').isEmail().withMessage('Wrong email format'),
  body('password', 'Password must be at least 6 characters and contains numbers and letter')
    .isLength({ min: 6, max: 20 })
    .isAlphanumeric(),
  body('confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password do not match');
    }
    return true;
  }),
  body('name', 'Name must contain at least 5 characters').isLength({ min: 5, max: 15 }),
];
