const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const foundUser = await User.findOne({ email }).exec();

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (foundUser) {
    return res.status(401).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
  });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
  res.json({
    accessToken,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email }).exec();

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!foundUser) {
    return res.status(401).json({ message: 'User doe not exists' });
  }
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: 'Wrong Password' });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
  res.json({
    accessToken,
    email: foundUser.email,
  });
};
module.exports = {
  register,
  login,
};
