const questionsArray = [
  {
    imageUrl: "https://example.com/image1.jpg",
    question: "What is your favorite color?",
    isChosen: false
  },
  {
    imageUrl: "https://example.com/image2.jpg",
    question: "Do you like coffee or tea?",
    isChosen: false
  },
  {
    imageUrl: "https://example.com/image3.jpg",
    question: "Have you ever traveled abroad?",
    isChosen: false
  }
];

let currentIndex = 0;
window.onload = function() {
  const imageEl = document.getElementById('card-image');
  const questionEl = document.getElementById('card-question');
  const nextBtn = document.getElementById('next-btn');
  const cardEl = document.getElementById('question-card');

  function getNextUnchosenIndex(startIdx) {
    for (let i = 0; i < questionsArray.length; i++) {
      const idx = (startIdx + i) % questionsArray.length;
      if (!questionsArray[idx].isChosen) {
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
    item.isChosen = true;
  }

  nextBtn.addEventListener('click', () => {
    const nextIdx = getNextUnchosenIndex(currentIndex + 1);
    currentIndex = nextIdx;
    renderCard(currentIndex);
  });

  // Initial render
  currentIndex = getNextUnchosenIndex(0);
  renderCard(currentIndex);
};
