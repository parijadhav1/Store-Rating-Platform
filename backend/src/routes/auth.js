import bcrypt from 'bcryptjs';
import express from 'express';
import { query } from '../db.js';
import { AppError } from '../errors.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { assertPassword, validateUserInput } from '../validation.js';

export const authRouter = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role
  };
}

authRouter.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;
    validateUserInput({ name, email, password, address, role: 'USER' });
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim()]
    );
    const user = result.rows[0];
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    if (error.code === '23505') return next(new AppError(409, 'Email is already registered.'));
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [
      String(email || '').trim().toLowerCase()
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      throw new AppError(401, 'Invalid email or password.');
    }

    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) throw new AppError(404, 'User not found.');
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

authRouter.patch('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    assertPassword(newPassword);

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0] || !(await bcrypt.compare(currentPassword || '', result.rows[0].password_hash))) {
      throw new AppError(401, 'Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
      passwordHash,
      req.user.id
    ]);

    res.json({ message: 'Password updated.' });
  } catch (error) {
    next(error);
  }
});
