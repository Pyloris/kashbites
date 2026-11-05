import { createApp } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[KashBites Backend] Running on http://localhost:${PORT}`);
});
