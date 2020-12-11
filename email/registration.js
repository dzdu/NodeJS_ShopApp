const keys = require('../keys');

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Welcome to store :3',
    html: `
    <h1> Welcome to our store!</h1>
    <p>Your account has been created successfully with email ${email}</p>
    <hr/>
    <a href="${keys.BASE_URL}"><butto>Open Page</butto></a>
    `,
  };
};
