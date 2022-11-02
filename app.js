require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');
const { handleDefaultError } = require('./middlewares/handleDefaultError');

const { PORT = 3000, DATABASE_URL, NODE_ENV } = process.env;

const app = express();

app.use(helmet());

mongoose.connect(NODE_ENV === 'production' ? DATABASE_URL : 'mongodb://localhost:27017/moviesdb');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(handleDefaultError);

app.listen(PORT, () => {
  console.log(`hello there, port: ${PORT}`);
});
