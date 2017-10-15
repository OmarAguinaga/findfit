const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  // from express-validator
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'You must supply a password!').notEmpty();
  req
    .checkBody('password-confirm', 'You must supply a password confirmation!')
    .notEmpty();
  req
    .checkBody('password-confirm', 'Ooos! Your passwords do not match')
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'register',
      body: req.body,
      flashes: req.flash()
    });

    return; // stop the fn form running
  }

  next(); // there were no error s
};