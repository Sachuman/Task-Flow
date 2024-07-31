const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');

app.use('/users', tasksRouter);
app.use('/auth', authRouter);

module.exports = app;
