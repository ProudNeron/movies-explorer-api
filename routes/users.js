const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUserInfo, patchUserInfo,
} = require('../controllers/users');

router.get('/me', getUserInfo);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email(),
  }).unknown(true),
}), patchUserInfo);

module.exports = router;
