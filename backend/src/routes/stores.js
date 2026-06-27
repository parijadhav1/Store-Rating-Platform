import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { assertRating } from '../validation.js';
import { like, sortClause } from '../utils/sorting.js';

export const storesRouter = express.Router();

storesRouter.use(requireAuth, requireRole('USER'));

storesRouter.get('/', async (req, res, next) => {
  try {
    const { name = '', address = '', sortBy = 'name', sortDir = 'asc' } = req.query;
    const orderBy = sortClause(
      sortBy,
      sortDir,
      { name: 's.name', address: 's.address', rating: 'overall_rating', userRating: 'user_rating' },
      'name'
    );
    const result = await query(
      `SELECT
         s.id,
         s.name,
         s.address,
         round(avg(all_ratings.rating)::numeric, 2) AS overall_rating,
         my_rating.rating AS user_rating
       FROM stores s
       LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
       LEFT JOIN ratings my_rating ON my_rating.store_id = s.id AND my_rating.user_id = $1
       WHERE s.name ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id, my_rating.rating
       ORDER BY ${orderBy}`,
      [req.user.id, like(name), like(address)]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

storesRouter.put('/:storeId/rating', async (req, res, next) => {
  try {
    const rating = assertRating(req.body.rating);
    const result = await query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
       RETURNING id, user_id, store_id, rating`,
      [req.user.id, req.params.storeId, rating]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
