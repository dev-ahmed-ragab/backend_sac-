require('dotenv').config();
console.log(process.env.NODE_ENV);
const path = require('path');

const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');

const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
// const PORT = process.env.PORT || 5500;
connectDB();

// const corsOptions = require('/config/corsOptions');
const cors = require('cors');
app.use(cors(true));
app.use(cookieParser());
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));

mongoose.connection.once('open', () => {
  app.listen(5000, () => {
    console.log('server running');
  });
});
mongoose.connection.on('error', (err) => {
  console.log(err);
});
