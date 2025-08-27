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

// API endpoint to get questions (default to spill_the_truth full list)
app.get('/api/questions', (req, res) => {
  const filePath = path.join(__dirname, 'questions_spill_the_truth.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load questions.' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse questions.' });
    }
  });
});

// API endpoint to get questions by category
app.get('/api/questions/:category', (req, res) => {
  const category = req.params.category;
  let file;
  if (category === 'spill_the_truth') file = 'questions_spill_the_truth.json';
  else if (category === 'memory_lane') file = 'questions_memory_lane.json';
  else if (category === 'fun_facts') file = 'questions_fun_facts.json';
  else return res.status(400).json({ error: 'Unknown category' });
  fs.readFile(path.join(__dirname, file), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load questions.' });
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse questions.' });
    }
  });
});

// API endpoint to get random questions from select categories (exclude memory lane)
app.get('/api/questions_random', (req, res) => {
  const files = ['questions_spill_the_truth.json', 'questions_fun_facts.json'];
  let allQuestions = [];
  let readCount = 0;
  files.forEach(file => {
    fs.readFile(path.join(__dirname, file), 'utf8', (err, data) => {
      readCount++;
      if (!err) {
        try {
          allQuestions = allQuestions.concat(JSON.parse(data));
        } catch {}
      }
      if (readCount === files.length) {
        // Shuffle questions
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);
        res.json(allQuestions);
      }
    });
  });
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
