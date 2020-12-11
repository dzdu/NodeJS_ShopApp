const { Router } = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function mapCartItem(cart) {
  //! flat object
  return cart.items.map((course) => ({
    ...course.courseId._doc,
    id: course.courseId.id,
    count: course.count,
  }));
}

function getPrice(courses) {
  return courses.reduce((total, course) => {
    return (total += course.price * course.count);
  }, 0);
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect('/cart');
});

router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id);
  const user = await req.user.populate('cart.items.courseId').execPopulate();
  const courses = mapCartItem(user.cart);
  const cart = {
    courses,
    price: getPrice(courses),
  };
  res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
  const user = await req.user.populate('cart.items.courseId').execPopulate();

  const courses = mapCartItem(user.cart);

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses: courses,
    price: getPrice(courses),
  });
});

module.exports = router;
