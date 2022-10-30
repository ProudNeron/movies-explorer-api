const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const ValidationOrCastError = require('../errors/validation-or-cast-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: (props) => `${props.value} не является почтовым адрессом`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxLength: 30,
  },
});

userSchema.statics.findUserByCredentials = function ({ email, password }) {
  if (!validator.isEmail(email)) {
    throw new ValidationOrCastError('Неправильные почта или пароль');
  }
  return this.findOne({ email }).select('+password')
    .orFail(new UnauthorizedError('Неправильные почта или пароль'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((match) => {
        if (!match) {
          throw new UnauthorizedError('Неправильные почта или пароль');
        }

        return user;
      }));
};

module.exports = mongoose.model('user', userSchema);
