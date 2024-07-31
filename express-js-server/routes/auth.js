const express = require('express');
const axios = require('axios');
const { User } = require('../mongodb/model'); // Adjust the path if needed
const router = express.Router();

router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Make a request to the Google OAuth2 API to get user information main line of the code is this
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);
    const userInfo = response.data;

    const email = userInfo.email;
    const name = userInfo.name;

    // Find or create user if not exists then yes make it exist
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }

    res.status(200).json({ userId: email, email, name, message: 'Token verified successfully' });
    console.log('Token verified successfully:', email);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
