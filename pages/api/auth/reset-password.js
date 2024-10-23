const bcrypt = require('bcryptjs');
const User = require('../../../models/user');

export default async function resetPassword(req, res) {
  const { email, resetCode, newPassword } = req.body;

  try {
    // Find user by email and reset code
    const user = await User.findOne({ where: { email, resetCode } });
    if (!user || user.resetCodeExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null; // Clear reset code after successful reset
    user.resetCodeExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
