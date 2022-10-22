const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const router = require('./api');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

app.listen(port, () => console.log(`Application started on port ${port}`));

mongoose.connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/wecup');

require('./jobs')