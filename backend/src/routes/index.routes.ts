import { Router } from 'express';

const router = Router();

/* Test route */
router.get('/', (req, res) => {
  res.send('Hello World');
});

/* Here are the routes */

export default router;