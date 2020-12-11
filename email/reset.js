const keys = require('../keys');

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Reset password',
    html: `
    <h1>Did you forgot your password?</h1>
    <hr/>
    <p>Press link below to reset your password</p>
    <a href="${keys.BASE_URL}auth/password/${token}">Reset password</a>
    <p> If it was not you - ignore this email</p>
    `,
  };
};
