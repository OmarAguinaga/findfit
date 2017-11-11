const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(gymController.getGyms));
router.get('/gyms', catchErrors(gymController.getGyms));
router.get('/add', authController.isLoggedIn, gymController.addGym);

router.post(
  '/add',
  gymController.upload,
  catchErrors(gymController.resize),
  catchErrors(gymController.createGym)
);

router.post(
  '/add/:id',
  gymController.upload,
  catchErrors(gymController.resize),
  catchErrors(gymController.updateGym)
);

router.get('/gyms/:id/edit', catchErrors(gymController.editGym));
router.get('/gym/:slug', catchErrors(gymController.getGymBySlug));

router.get('/tags', catchErrors(gymController.getGymsByTag));
router.get('/tags/:tag', catchErrors(gymController.getGymsByTag));

// Authentication

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post(
  '/register',
  userController.validateRegister,
  // we need to know about errors if
  // validation will be passed, but registration
  // will be failed in some reasons, e.g. second
  // registration with same email
  catchErrors(userController.register),
  authController.login
);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token',
  authController.confirmPasswords,
  catchErrors(authController.update)
);
router.get('/map', gymController.mapPage);
router.get(
  '/hearts',
  authController.isLoggedIn,
  catchErrors(gymController.getHearts)
);

router.post(
  '/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

/*
API
*/

router.get('/api/search', catchErrors(gymController.searchGym));
router.get('/api/gyms/near', catchErrors(gymController.mapGyms));
router.post('/api/gyms/:id/heart', catchErrors(gymController.heartGym));

module.exports = router;
