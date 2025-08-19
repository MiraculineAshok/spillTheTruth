let questionsArray = [];
let currentIndex = 0;
let chosenIndices = new Set();

const imageEl = document.getElementById('card-image');
const questionEl = document.getElementById('card-question');
const nextBtn = document.getElementById('next-btn');
const cardEl = document.getElementById('question-card');

function getNextUnchosenIndex(startIdx) {
  for (let i = 0; i < questionsArray.length; i++) {
    const idx = (startIdx + i) % questionsArray.length;
    if (!chosenIndices.has(idx)) {
      return idx;
    }
  }
  return -1; // All chosen
}

function renderCard(index) {
  if (index === -1) {
    cardEl.style.display = 'none';
    nextBtn.style.display = 'none';
    // Show a message when all questions are chosen
    const doneMsg = document.createElement('div');
    doneMsg.className = 'question';
    doneMsg.textContent = 'All questions have been shown!';
    document.body.appendChild(doneMsg);
    return;
  }
  const item = questionsArray[index];
  imageEl.src = item.imageUrl;
  imageEl.alt = `Image for question ${index + 1}`;
  questionEl.textContent = item.question;
  // Mark as chosen
  chosenIndices.add(index);
}

nextBtn.addEventListener('click', () => {
  const nextIdx = getNextUnchosenIndex(currentIndex + 1);
  currentIndex = nextIdx;
  renderCard(currentIndex);
});

// Fetch questions from API and initialize
fetch('/api/questions')
  .then(res => res.json())
  .then(data => {
    questionsArray = data;
    currentIndex = getNextUnchosenIndex(0);
    renderCard(currentIndex);
  })
  .catch(() => {
    questionEl.textContent = 'Failed to load questions.';
    nextBtn.style.display = 'none';
  });
