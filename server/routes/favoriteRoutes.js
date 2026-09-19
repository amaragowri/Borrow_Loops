const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getFavorites);
router.post('/:listingId', toggleFavorite);
router.delete('/:listingId', toggleFavorite); // supports DELETE as well

module.exports = router;
