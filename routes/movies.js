const router = require('express').Router();
const {
  getMoviesOfUser, postMovie, deleteMovie,
} = require('../controllers/movies');
const { validatePostMovie, validateDeleteMovie } = require('../middlewares/route-validation');

router.get('/', getMoviesOfUser);
router.post('/', validatePostMovie, postMovie);
router.delete('/:movieId', validateDeleteMovie, deleteMovie);

module.exports = router;
