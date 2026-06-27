import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool, query } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createUser({ name, email, password, address, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [name, email, passwordHash, address, role]
  );
  return result.rows[0].id;
}

async function seed() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(schema);

  const adminId = await createUser({
    name: 'Aarav System Administrator',
    email: 'admin@stores.test',
    password: 'Admin@123',
    address: 'Corporate HQ, Central Business District',
    role: 'ADMIN'
  });

  const ownerOneId = await createUser({
    name: 'Priya Neighborhood Store Owner',
    email: 'owner@stores.test',
    password: 'Owner@123',
    address: '22 Market Road, Koramangala, Bengaluru',
    role: 'OWNER'
  });

  const ownerTwoId = await createUser({
    name: 'Kabir Premium Retail Owner',
    email: 'owner2@stores.test',
    password: 'Owner@123',
    address: '18 Lake View Avenue, Indiranagar, Bengaluru',
    role: 'OWNER'
  });

  const userOneId = await createUser({
    name: 'Nisha Everyday Shopping User',
    email: 'user@stores.test',
    password: 'User@123',
    address: '7 Residency Lane, Bengaluru',
    role: 'USER'
  });

  const userTwoId = await createUser({
    name: 'Rahul Local Ratings Member',
    email: 'user2@stores.test',
    password: 'User@123',
    address: '41 Green Park Layout, Bengaluru',
    role: 'USER'
  });

  const stores = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES
       ($1, $2, $3, $4),
       ($5, $6, $7, $8),
       ($9, $10, $11, NULL)
     RETURNING id`,
    [
      'Fresh Basket Neighborhood Market',
      'freshbasket@stores.test',
      '22 Market Road, Koramangala, Bengaluru',
      ownerOneId,
      'Urban Pantry Premium Grocers',
      'urbanpantry@stores.test',
      '18 Lake View Avenue, Indiranagar, Bengaluru',
      ownerTwoId,
      'Daily Needs Community Store',
      'dailyneeds@stores.test',
      '5 Station Street, Malleshwaram, Bengaluru'
    ]
  );

  await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, 5), ($1, $3, 4), ($4, $2, 3), ($4, $3, 5)`,
    [userOneId, stores.rows[0].id, stores.rows[1].id, userTwoId]
  );

  console.log('Database seeded.');
  console.log('Admin: admin@stores.test / Admin@123');
  console.log('User: user@stores.test / User@123');
  console.log('Owner: owner@stores.test / Owner@123');
  console.log(`Seed admin id: ${adminId}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
