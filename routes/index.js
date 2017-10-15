const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const userController = require('../controllers/userController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(gymController.getGyms));
router.get('/gyms', catchErrors(gymController.getGyms));
router.get('/add', gymController.addGym);

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
  catchErrors(gymController.createGym)
);

router.get('/gyms/:id/edit', catchErrors(gymController.editGym));
router.get('/gym/:slug', catchErrors(gymController.getGymBySlug));

router.get('/tags', catchErrors(gymController.getGymsByTag));
router.get('/tags/:tag', catchErrors(gymController.getGymsByTag));

// Authentication

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

// Validate registration data
// register the user
// log them in
router.post('/register', userController.validateRegister);

module.exports = router;
