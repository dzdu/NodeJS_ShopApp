module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated;
  //* защищает соеденение
  res.locals.csrf = req.csrfToken();

  next();
};
