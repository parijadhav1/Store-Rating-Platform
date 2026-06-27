import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const ownerRouter = express.Router();

ownerRouter.use(requireAuth, requireRole('OWNER'));

ownerRouter.get('/dashboard', async (req, res, next) => {
  try {
    const storeResult = await query(
      `SELECT
         s.id,
         s.name,
         s.address,
         round(avg(r.rating)::numeric, 2) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.name`,
      [req.user.id]
    );

    const ratingsResult = await query(
      `SELECT
         r.id,
         r.rating,
         r.updated_at,
         s.name AS store_name,
         u.name AS user_name,
         u.email AS user_email,
         u.address AS user_address
       FROM ratings r
       JOIN stores s ON s.id = r.store_id
       JOIN users u ON u.id = r.user_id
       WHERE s.owner_id = $1
       ORDER BY r.updated_at DESC`,
      [req.user.id]
    );

    res.json({ stores: storeResult.rows, ratings: ratingsResult.rows });
  } catch (error) {
    next(error);
  }
});
