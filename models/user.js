const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: String,
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (course) {
  //! Need to use this
  //const items = this.cart.items.concat() //! old syntax
  const items = [...this.cart.items];
  const index = items.findIndex((c) => {
    return c.courseId.toString() === course._id.toString();
  });
  if (index >= 0) {
    // items[index].count = this.cart.items[index].count + 1;    items[index].count = this.cart.items[index].count
    items[index].count = items[index].count + 1;
  } else {
    items.push({
      courseId: course._id,
      count: 1,
    });
  }
  // const newCart = { items: items };
  // this.cart = newCart;
  this.cart = { items };
  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items];
  const index = items.findIndex((index) => {
    return index.courseId.toString() === id.toString();
  });
  items[index].count === 1
    ? (items = items.filter((course) => course.courseId.toString() !== id.toString()))
    : items[index].count--;
  this.cart = { items };
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model('User', userSchema);
