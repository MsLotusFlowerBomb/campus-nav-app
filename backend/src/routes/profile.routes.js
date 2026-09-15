const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const profileController = require('../controllers/profile.controller');

// Every profile route requires an authenticated user.
router.use(authenticateUser);

// Profile
router.get('/', profileController.getMe);
router.put('/', profileController.updateMe);

// Favourites
router.get('/favourites', profileController.getFavourites);
router.post('/favourites/:placeId', profileController.addFavourite);
router.delete('/favourites/:placeId', profileController.removeFavourite);

module.exports = router;