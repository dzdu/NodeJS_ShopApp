const { Router } = require('express');
const router = Router();
const Course = require('../models/course');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add courses',
    isAdd: true,
  });
});

router.post('/', auth, async (req, res) => {
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    image: req.body.image,
    userId: req.user,
  });
  try {
    await course.save();
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
