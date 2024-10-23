const User = require('../../../models/user');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../../../lib/mailer');

export default async function requestReset(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetCode = uuidv4();
    user.resetCode = resetCode;
    user.resetCodeExpiry = Date.now() + 3600000; // 1 hour validity
    await user.save();

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Code',
      html: `<p>Your password reset code is: <strong>${resetCode}</strong></p>`,
    });

    res.status(200).json({ message: 'Reset code sent to email.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
