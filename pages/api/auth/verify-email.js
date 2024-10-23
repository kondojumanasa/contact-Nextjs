const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

export default async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and mark as verified
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
}
