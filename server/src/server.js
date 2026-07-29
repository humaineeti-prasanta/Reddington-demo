import 'dotenv/config';
import app from './app.js';
import { startDsarWorker } from './jobs/dsarWorker.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`reddington server listening on http://localhost:${PORT}`);
  startDsarWorker();
});
