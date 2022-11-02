const Movies = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const ValidationOrCastError = require('../errors/validation-or-cast-error');
const AuthorizedButForbidden = require('../errors/authorized-but-forbidden-error');

module.exports.getMoviesOfUser = (req, res, next) => {
  Movies.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailerLink, thumbnail,
    movieId, nameRU, nameEN,
  } = req.body;
  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationOrCastError('некорректные данные для сохранения фильма'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movies.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError(`Фильм с указанным _id:${req.params.movieId} не найден`);
    })
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new AuthorizedButForbidden('Попытка удалить чужой фильм');
      }
      Movies.findByIdAndRemove(req.params.movieId)
        .then(() => res.send({ message: 'Фильм удалён' }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationOrCastError('Некорректный _id фильма'));
      }
      return next(err);
    });
};
