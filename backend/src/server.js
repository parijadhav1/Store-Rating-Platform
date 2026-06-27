import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler, notFound } from './errors.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { ownerRouter } from './routes/owner.js';
import { storesRouter } from './routes/stores.js';

const app = express();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stores', storesRouter);
app.use('/api/owner', ownerRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
