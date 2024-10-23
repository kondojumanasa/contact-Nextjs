const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const transporter = require('../../../lib/mailer');

export default async function register(req, res) {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    // Create a verification token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Verification link
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    // Send email
    await transporter.sendMail({
      to: newUser.email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    });

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
