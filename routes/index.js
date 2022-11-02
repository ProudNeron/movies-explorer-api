const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const { login, createUser } = require('../controllers/users');
const { auth } = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');
const { validateSignin, validateSignup } = require('../middlewares/route-validation');

router.post('/signin', validateSignin, login);
router.post('/signup', validateSignup, createUser);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Некорректный путь'));
});

module.exports = router;
