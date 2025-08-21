document.addEventListener('DOMContentLoaded', () => {
  const landingPage = document.getElementById('landing-page');
  const cardContainer = document.getElementById('card-container');
  const questionCard = document.getElementById('question-card');
  const imageEl = document.getElementById('card-image');
  const questionEl = document.getElementById('card-question');
  const nextBtn = document.getElementById('next-btn');
  const reserveBtn = document.getElementById('reserve-btn');
  const startOverBtn = document.getElementById('start-over-btn');
  const gameOver = document.getElementById('game-over');
  const backBtn = document.getElementById('back-btn');
  const cardNumberInput = document.getElementById('card-number-input');
  const serialBadge = document.getElementById('serial-badge');
  const cardTopControls = document.querySelector('.card-top-controls');

  let questions = [];
  let currentIndex = 0;
  let answeredIndices = new Set();
  let reservedIndices = new Set();

  function showLanding() {
    landingPage.style.display = 'block';
    cardContainer.style.display = 'none';
    gameOver.style.display = 'none';
    questionCard.style.display = 'none';
    cardTopControls.style.display = 'none';
  }

  function showGame() {
    landingPage.style.display = 'none';
    cardContainer.style.display = 'block';
    gameOver.style.display = 'none';
    questionCard.style.display = 'flex';
    cardTopControls.style.display = 'block';
  }

  function renderCard(index) {
    const q = questions[index];
    if (!q) return;
    imageEl.src = q.imageUrl || '';
    questionEl.textContent = q.question || '';
    serialBadge.textContent = q.serialNumber ? `#${q.serialNumber}` : '';
  }

  function getNextUnansweredIndex(startIdx) {
    // First try from startIdx to end
    for (let i = startIdx; i < questions.length; i++) {
      if (!answeredIndices.has(i)) {
        return i;
      }
    }
    // If not found, try from beginning to startIdx
    for (let i = 0; i < startIdx; i++) {
      if (!answeredIndices.has(i)) {
        return i;
      }
    }
    return -1; // All answered
  }

  function showNext() {
    // Mark current as answered
    answeredIndices.add(currentIndex);
    reservedIndices.delete(currentIndex);
    console.log(`Marked question ${currentIndex} as answered. Total answered: ${answeredIndices.size}/${questions.length}`);
    
    // Find next unanswered question
    const nextIdx = getNextUnansweredIndex(currentIndex + 1);
    console.log(`Next unanswered index: ${nextIdx}`);
    if (nextIdx === -1) {
      // Game over - all questions answered
      console.log('Game over - all questions answered');
      gameOver.style.display = 'block';
      questionCard.style.display = 'none';
      cardTopControls.style.display = 'none';
      return;
    }
    currentIndex = nextIdx;
    renderCard(currentIndex);
  }

  function reserveCurrent() {
    reservedIndices.add(currentIndex);
    
    // Find next unanswered question
    let nextIdx = getNextUnansweredIndex(currentIndex + 1);
    if (nextIdx === -1 && reservedIndices.size > 0) {
      // If all others are answered, pick from reserved
      nextIdx = Array.from(reservedIndices)[0];
    }
    if (nextIdx === -1) {
      // Game over
      gameOver.style.display = 'block';
      questionCard.style.display = 'none';
      cardTopControls.style.display = 'none';
      return;
    }
    currentIndex = nextIdx;
    renderCard(currentIndex);
  }

  // category selection
  document.querySelectorAll('.category-card').forEach(card => {
    if (card.classList.contains('disabled')) return;
    
    const img = card.dataset.image;
    const bg = card.querySelector('.category-card-bg');
    if (bg && img) {
      bg.style.backgroundImage = `url(${img})`;
    }
    
    card.addEventListener('click', async () => {
      const category = card.dataset.category;
      let url;
      if (category === 'random') url = '/api/questions_random';
      else if (category === 'spill_the_truth') url = '/api/questions/spill_the_truth';
      else url = `/api/questions/${category}`;
      
      try {
        const res = await fetch(url);
        questions = await res.json();
        console.log(`Loaded ${questions.length} questions for category: ${category}`);
        console.log('Questions:', questions);
        currentIndex = 0;
        answeredIndices.clear();
        reservedIndices.clear();
        showGame();
        renderCard(currentIndex);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    });
  });

  nextBtn.addEventListener('click', showNext);
  reserveBtn.addEventListener('click', reserveCurrent);
  
  startOverBtn?.addEventListener('click', () => {
    showLanding();
  });
  
  backBtn?.addEventListener('click', () => {
    showLanding();
  });
  
  cardNumberInput?.addEventListener('change', () => {
    const val = Number(cardNumberInput.value);
    if (!Number.isInteger(val) || val < 1 || val > questions.length) return;
    
    // Find question with matching serial number
    let targetIndex = -1;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].serialNumber === val) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) targetIndex = val - 1; // fallback to index
    
    if (targetIndex >= 0 && targetIndex < questions.length) {
      currentIndex = targetIndex;
      renderCard(currentIndex);
    }
  });

  // default state
  showLanding();
});

