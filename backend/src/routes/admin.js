import bcrypt from 'bcryptjs';
import express from 'express';
import { query } from '../db.js';
import { AppError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { assertAddress, assertEmail, assertName, validateUserInput } from '../validation.js';
import { like, sortClause } from '../utils/sorting.js';

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/dashboard', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM stores) AS stores,
        (SELECT count(*)::int FROM ratings) AS ratings
    `);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, address, role = 'USER' } = req.body;
    validateUserInput({ name, email, password, address, role });
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return next(new AppError(409, 'Email is already registered.'));
    next(error);
  }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const {
      name = '',
      email = '',
      address = '',
      role = '',
      sortBy = 'name',
      sortDir = 'asc'
    } = req.query;
    const orderBy = sortClause(
      sortBy,
      sortDir,
      { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' },
      'name'
    );
    const result = await query(
      `SELECT
         u.id, u.name, u.email, u.address, u.role,
         CASE WHEN u.role = 'OWNER' THEN round(avg(r.rating)::numeric, 2) ELSE NULL END AS owner_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.name ILIKE $1
         AND u.email ILIKE $2
         AND u.address ILIKE $3
         AND ($4::text = '' OR u.role::text = $4)
       GROUP BY u.id
       ORDER BY ${orderBy}`,
      [like(name), like(email), like(address), role]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         u.id, u.name, u.email, u.address, u.role,
         CASE WHEN u.role = 'OWNER' THEN round(avg(r.rating)::numeric, 2) ELSE NULL END AS owner_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );
    if (!result.rows[0]) throw new AppError(404, 'User not found.');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/stores', async (req, res, next) => {
  try {
    const { name, email, address, ownerId = null } = req.body;
    assertName(name);
    assertEmail(email);
    assertAddress(address);

    if (ownerId) {
      const owner = await query('SELECT id FROM users WHERE id = $1 AND role = $2', [ownerId, 'OWNER']);
      if (!owner.rows[0]) throw new AppError(400, 'Owner must be an existing STORE OWNER user.');
    }

    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return next(new AppError(409, 'Store email is already registered.'));
    next(error);
  }
});

adminRouter.get('/stores', async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', sortBy = 'name', sortDir = 'asc' } = req.query;
    const orderBy = sortClause(
      sortBy,
      sortDir,
      { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' },
      'name'
    );
    const result = await query(
      `SELECT
         s.id, s.name, s.email, s.address, s.owner_id,
         round(avg(r.rating)::numeric, 2) AS rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id
       ORDER BY ${orderBy}`,
      [like(name), like(email), like(address)]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});
