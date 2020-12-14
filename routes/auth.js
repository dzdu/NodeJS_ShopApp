const { Router } = require('express');
const router = Router();
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../email/registration');
const resetEmail = require('../email/reset');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');

//TODO make pass confirm

const transport = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY },
  }),
);

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});
router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/login', async (req, res) => {
  try {
    //! User check, pass mm
    const { email, password } = req.body;

    const canditate = await User.findOne({ email });

    if (canditate) {
      //* val two pass
      const areSame = await bcrypt.compare(password, canditate.password);
      if (areSame) {
        req.session.user = canditate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }

          res.redirect('/');
        });
      } else {
        req.flash('loginError', 'Wrong password');
        res.redirect('/auth/login#login');
        req.session.save(); //* Fix if not working well
      }
    } else {
      req.flash('loginError', 'User do not exists');
      res.redirect('/auth/login#login');
      req.session.save();
    }
  } catch (error) {
    console.log(error);
  }
});
//! hash password
router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req); //* validation
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    //Creating new user
    const user = new User({ email, name, password: hashPassword, cart: { items: [] } });
    await user.save();
    res.redirect('/auth/login#login');
    await transport.sendMail(regEmail(email));
  } catch (error) {
    console.log(error);
  }
});

//! reset password
router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset Password',
    isLogin: false,
    resetError: req.flash('resetError'),
    wrongError: req.flash('wrongError'),
  });
});
router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash(
          'resetError',
          'Something went wrong, please try again later, or contact support.',
        );
        return res.redirect('./reset');
      }

      const token = buffer.toString('hex');
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await user.save();
        await transport.sendMail(resetEmail(user.email, token));
        res.redirect('/auth/login#login');
      } else {
        req.flash('wrongError', 'Looks like email do not exist in database');
        res.redirect('./reset');
        res.session.save();
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//! new password
router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login#login');
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect('/auth/login#login');
    } else {
      res.render('auth/password', {
        title: 'Create new Password',
        resetError: req.flash('resetError'),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login#login');
    } else {
      res.flash('resetError', 'Token has expired, please reset password again');
      res.redirect('/auth/login#login');
      res.session.save();
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
