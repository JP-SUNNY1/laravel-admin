import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve dist for built assets
app.use('/dist', express.static(path.join(__dirname, 'public/build')));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.php'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
