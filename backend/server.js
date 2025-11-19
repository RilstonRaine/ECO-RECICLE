// server.js
require('dotenv').config();

const app = require('./src/app');
const { ensureStorageBuckets } = require('./src/config/supabaseServiceClient');

const PORT = process.env.PORT || 3000;

ensureStorageBuckets()
  .then(() => console.log('[storage] bucket OK'))
  .catch(err => console.error('[storage ensure]', err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`API on http://localhost:${PORT}`);
    });
  });