const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get questions
app.get('/api/questions', (req, res) => {
  fs.readFile(path.join(__dirname, 'questions.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load questions.' });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
