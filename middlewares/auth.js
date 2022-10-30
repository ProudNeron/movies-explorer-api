const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports.auth = (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    throw new UnauthorizedError('некорректный токен');
  }

  const token = extractBearerToken(bearerToken);

  let payload = null;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'superSecret');
  } catch (err) {
    const unauthorizedError = new UnauthorizedError('невалидный токен');
    unauthorizedError.name = err.name;
    return next(unauthorizedError);
  }

  req.user = payload;

  return next();
};
