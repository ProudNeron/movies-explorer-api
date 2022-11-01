const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ValidationOrCastError = require('../errors/validation-or-cast-error');
const ConflictError = require('../errors/conflict-error');

module.exports.getUserInfo = (req, res, next) => {
  Users.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError(`Пользователь по указанному _id: ${req.params.userId} не найден`);
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationOrCastError('Некорректный _id пользователя'));
      }
      return next(err);
    });
};

module.exports.patchUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  Users.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError(`Пользователь по указанному _id: ${req.params.userId} не найден`);
    })
    .then((user) => res.send({
      name: user.name, email: user.email, _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationOrCastError('Некорректный _id пользователя'));
      }
      if (err.name === 'ValidationError') {
        return next(new ValidationOrCastError('Невалидные данные'));
      }
      if (err.name === 'MongoServerError' || err.code === 11000) {
        return next(new ConflictError('Почтовый адресс уже занят'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  Users.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Указанный почтовый адресс уже занят');
      } else {
        return bcrypt.hash(password, 10)
          .then((hash) => Users.create({
            password: hash, email, name,
          }))
          .then(() => res.send({ email, name }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return next(new ValidationOrCastError('Переданы невалидные данные'));
            }
            return next(err);
          });
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  Users.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'superSecret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};
